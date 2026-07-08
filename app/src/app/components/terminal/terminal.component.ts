import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';

/**
 * Interactive, typeable terminal shell. Ported from the approved v6b mockup:
 * a draggable, macOS-styled window (traffic lights, minimize/maximize/close)
 * with a small built-in command engine and fish/zsh-style live autocomplete.
 *
 * The .term element physically reparents itself to <body> after view init so
 * it can be dragged into any part of the page - not just the column it was
 * declared in - while still scrolling naturally with the rest of the page.
 */
@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
})
export class TerminalComponent implements AfterViewInit, OnDestroy {
  /** Element the terminal uses to compute its default resting position. */
  @Input() anchor?: HTMLElement;

  /** Emits true when the terminal is closed, false when it's reopened. */
  @Output() closedChange = new EventEmitter<boolean>();

  @ViewChild('termEl') termEl!: ElementRef<HTMLElement>;
  @ViewChild('termOutput') termOutput!: ElementRef<HTMLElement>;
  @ViewChild('cmdInput') cmdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cmdDisplay') cmdDisplay!: ElementRef<HTMLElement>;

  revealed = false;
  closed = false;
  minimized = false;
  maximized = false;

  private prevRect: { left: string; top: string; width: string } | null = null;
  private dragOffset: { x: number; y: number } | null = null;
  private dragMoved = false;
  private currentSuggestion: string | null = null;

  private readonly knownCommands = [
    'help', 'whoami', 'aboutme', 'skills', 'history', 'contact', 'clear',
    'sudo', 'tree -l 2 -a', 'git log --all --decorate --oneline --graph',
  ];

  private readonly commands: Record<string, () => string | null> = {
    help: () => this.helpText,
    whoami: () => `Francesco Lombardo — Senior Cloud &amp; DevOps Engineer`,
    aboutme: () => `Senior Cloud &amp; DevOps Engineer specializing in networking infrastructure architecture, managing Kubernetes clusters at scale, and maintaining internal DevOps platforms. I design resilient cloud architectures across AWS and GCP and treat infrastructure as code by default. For the full story, run <span class="accent">history</span>.`,
    skills: () => `<pre>.
├── hard-skills/
│   ├── cloud platform:     AWS, GCP
│   ├── iac:                Terraform, Pulumi
│   ├── config management:  Ansible
│   ├── containerization:   Kubernetes, Docker
│   ├── languages:          Golang, Python, Bash script, NodeJs, Typescript, Angular, C++, Java
│   └── other:              network architecture and security, serverless computing and micro services architecture
└── soft-skills/
    ├── Agile Methodologies and Team Leadership
    ├── Project and Time Management
    ├── Communication and Collaboration
    ├── Problem-Solving and Decision Making
    └── Continuous Learning and Adaptability

6 hard skills, 5 soft skills</pre>`,
    history: () => `<pre><span class="commit-hash">*</span> 9f2a1c4 <span class="muted">(HEAD -&gt; master)</span> Senior Cloud &amp; DevOps Engineer @ Fastweb + Vodafone — networking infra, Kubernetes clusters, internal DevOps platform (Milan)
<span class="commit-hash">*</span>   a1b2c3d Merge branch 'feature/french-experience' into master
<span class="commit-hash">|\\</span>
<span class="commit-hash">|</span> <span class="commit-hash">*</span> f7e6d5c DevOps Engineer @ Orange (Côte d'Azur, France)
<span class="commit-hash">|</span> <span class="commit-hash">*</span> e4d3c2b C++ Software Engineer @ Amadeus (Côte d'Azur, France)
<span class="commit-hash">|/</span>
<span class="commit-hash">*</span>   c9b8a7f Merge branch 'feature/study-career' into master
<span class="commit-hash">|\\</span>
<span class="commit-hash">|</span> <span class="commit-hash">*</span> 6a5b4c3 Master's degree, Computer Software Engineering — Polito (Turin)
<span class="commit-hash">|</span> <span class="commit-hash">*</span> 3d2e1f0 Bachelor's degree, Telecommunication Engineering — Kore University (Enna)
<span class="commit-hash">|/</span>
<span class="commit-hash">*</span> 1b0e6a2 Born and raised in Sicily</pre>`,
    contact: () => `<span class="cmd-name">Email</span><a href="mailto:fra.lombardo92@gmail.com">fra.lombardo92@gmail.com</a><br>
      <span class="cmd-name">LinkedIn</span><a href="https://www.linkedin.com/in/itsfrancescolombardo" target="_blank" rel="noopener">/in/itsfrancescolombardo</a><br>
      <span class="cmd-name">GitHub</span><a href="https://github.com/fralomb" target="_blank" rel="noopener">/fralomb</a>`,
    clear: () => { this.bootSequence(); return null; },
  };

  constructor(
    private analytics: AnalyticsService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngAfterViewInit(): void {
    // Move the terminal to the very end of <body> so it can be dragged into
    // any part of the page - over the nav, the heading, or the footer - and
    // not just the column it happens to be declared in.
    this.renderer.appendChild(this.document.body, this.termEl.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.termEl?.nativeElement?.parentNode) {
      this.termEl.nativeElement.parentNode.removeChild(this.termEl.nativeElement);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.revealed && !this.maximized) {
      this.positionDefault();
    }
  }

  /** Called by the host page once the hero heading animation has finished (or been skipped). */
  reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    this.positionDefault();
    this.bootSequence();
    setTimeout(() => this.cmdInput.nativeElement.focus(), 200);
  }

  /** Called by the host page's "reconnect session" chip. */
  reopen(): void {
    this.closed = false;
    this.closedChange.emit(false);
    this.analytics.trackEvent('TERMINAL_REOPENED', 'User reopened the terminal after closing it', 'INTEREST');
    setTimeout(() => this.cmdInput.nativeElement.focus(), 200);
  }

  focusInput(): void {
    this.cmdInput.nativeElement.focus();
  }

  // ---------- positioning ----------

  private isMobile(): boolean {
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 640;
  }

  private clampToPage(left: number, top: number, width: number, height: number) {
    const maxLeft = Math.max(4, this.document.documentElement.scrollWidth - width - 4);
    const maxTop = Math.max(4, this.document.documentElement.scrollHeight - height - 4);
    return {
      left: Math.min(Math.max(4, left), maxLeft),
      top: Math.min(Math.max(4, top), maxTop),
    };
  }

  private positionDefault(): void {
    const el = this.termEl.nativeElement;
    const width = Math.min(640, window.innerWidth * 0.92);
    el.style.width = width + 'px';

    const anchorRect = (this.anchor ?? this.document.body).getBoundingClientRect();
    const wanted = this.clampToPage(
      anchorRect.left + anchorRect.width / 2 - width / 2,
      anchorRect.top + window.scrollY + 8,
      width,
      el.offsetHeight || 300,
    );
    el.style.left = wanted.left + 'px';
    el.style.top = wanted.top + 'px';
  }

  // ---------- traffic lights ----------

  onClose(e: Event): void {
    e.stopPropagation();
    this.closed = true;
    this.closedChange.emit(true);
    this.analytics.trackEvent('TERMINAL_CLOSED', 'User closed the interactive terminal window', 'INTERACTION');
  }

  onMinimizeToggle(e: Event): void {
    e.stopPropagation();
    this.minimized = !this.minimized;
    this.analytics.trackEvent(
      this.minimized ? 'TERMINAL_MINIMIZED' : 'TERMINAL_RESTORED',
      this.minimized ? 'User minimized the terminal window' : 'User restored the terminal from minimized',
      'INTERACTION',
    );
  }

  onMaximizeToggle(e: Event): void {
    e.stopPropagation();
    const el = this.termEl.nativeElement;
    if (this.maximized) {
      this.maximized = false;
      if (this.prevRect) {
        el.style.left = this.prevRect.left;
        el.style.top = this.prevRect.top;
        el.style.width = this.prevRect.width;
      }
      this.analytics.trackEvent('TERMINAL_RESTORED', 'User restored the terminal from maximized', 'INTERACTION');
    } else {
      this.prevRect = { left: el.style.left, top: el.style.top, width: el.style.width };
      this.maximized = true;
      this.analytics.trackEvent('TERMINAL_MAXIMIZED', 'User maximized the terminal window', 'INTERACTION');
    }
  }

  // ---------- dragging ----------
  // Offsets are computed relative to <body> (the terminal's offsetParent), so it keeps its
  // place in the page as the user scrolls, both during and after a drag. Disabled on
  // mobile/touch - a small draggable window fights with scrolling on a phone.

  onPointerDown(e: PointerEvent): void {
    if (this.isMobile() || e.pointerType === 'touch') return;
    const target = e.target as HTMLElement;
    if (target.closest('.tl') || this.maximized) return;

    const el = this.termEl.nativeElement;
    this.dragOffset = { x: e.clientX - el.offsetLeft, y: e.clientY - el.offsetTop };
    this.dragMoved = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.dragOffset) return;
    const el = this.termEl.nativeElement;
    const wanted = this.clampToPage(
      e.clientX - this.dragOffset.x,
      e.clientY - this.dragOffset.y,
      el.offsetWidth,
      el.offsetHeight,
    );
    el.style.left = wanted.left + 'px';
    el.style.top = wanted.top + 'px';
    this.dragMoved = true;
  }

  onPointerUp(): void {
    if (this.dragOffset && this.dragMoved) {
      this.analytics.trackEvent('TERMINAL_DRAGGED', 'User repositioned the terminal window by dragging it', 'INTERACTION');
    }
    this.dragOffset = null;
  }

  // ---------- command engine ----------

  private get helpText(): string {
    return `Available commands:<br>
    <span class="accent cmd-name">whoami</span>show who I am<br>
    <span class="accent cmd-name">aboutme</span>a short bio<br>
    <span class="accent cmd-name">skills</span>what I work with<br>
    <span class="accent cmd-name">history</span>my career<br>
    <span class="accent cmd-name">contact</span>how to reach me<br>
    <span class="accent cmd-name">clear</span>clear the terminal`;
  }

  private bootSequence(): void {
    const output = this.termOutput.nativeElement;
    output.innerHTML = '';
    const now = new Date();
    this.print(`Welcome to francesco-lombardo.it — v2.0<br>Last login: ${now.toDateString()} ${now.toTimeString().slice(0, 8)} on ttys001`, 'muted');
    this.print(`<span class="echo"><span class="prompt">$</span> help</span>`);
    this.print(this.helpText);
  }

  private print(html: string, cls?: string): void {
    const output = this.termOutput.nativeElement;
    const div = this.document.createElement('div');
    div.className = 'block' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  private trackCommand(eventName: string, description: string): void {
    this.analytics.trackEvent(eventName, description, 'INTEREST');
  }

  private runCommand(rawInput: string): void {
    const raw = rawInput;
    const cmd = raw.trim().toLowerCase();
    if (cmd.length) {
      this.print(`<span class="echo"><span class="prompt">$</span> ${this.escapeHtml(raw)}</span>`);
    }
    if (!cmd) return;

    if (cmd.startsWith('sudo')) {
      this.print('Permission denied: nice try though.', 'muted');
      this.trackCommand('COMMAND_SUDO', `User attempted "${raw}"`);
    } else if (cmd.startsWith('tree')) {
      this.print(this.commands['skills']()!);
      this.trackCommand('COMMAND_TREE', `User ran "${raw}"`);
    } else if (cmd.startsWith('git log')) {
      this.print(this.commands['history']()!);
      this.trackCommand('COMMAND_GITLOG', `User ran "${raw}"`);
    } else if (this.commands[cmd]) {
      const res = this.commands[cmd]();
      if (res) this.print(res);
      this.trackCommand(`COMMAND_${cmd.toUpperCase()}`, `User ran "${cmd}"`);
    } else {
      this.print(`command not found: ${this.escapeHtml(cmd)}. Type <span class="accent">help</span> for a list of commands.`, 'muted');
      this.trackCommand('COMMAND_NOT_FOUND', `User attempted "${raw}"`);
    }

    const output = this.termOutput.nativeElement;
    output.scrollTop = output.scrollHeight;
  }

  // ---------- autocomplete ----------
  // Fish/zsh-style live suggestion: as you type, the rest of the best-matching command
  // shows as a dim "ghost" suffix right after your cursor. The typed part turns green when
  // it's a valid prefix of a real command, red when it isn't. Tab accepts the suggestion.

  updateSuggestion(): void {
    const raw = this.cmdInput.nativeElement.value;
    const display = this.cmdDisplay.nativeElement;
    if (!raw) {
      display.innerHTML = '';
      this.currentSuggestion = null;
      return;
    }
    const typed = raw.toLowerCase();
    const match = this.knownCommands.find((c) => c.startsWith(typed));
    if (match) {
      this.currentSuggestion = match;
      const ghost = match.slice(raw.length);
      display.innerHTML = `<span class="typed-ok">${this.escapeHtml(raw)}</span><span class="ghost">${this.escapeHtml(ghost)}</span>`;
    } else {
      this.currentSuggestion = null;
      display.innerHTML = `<span class="typed-bad">${this.escapeHtml(raw)}</span>`;
    }
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const input = this.cmdInput.nativeElement;
      const val = input.value;
      input.value = '';
      this.updateSuggestion();
      this.runCommand(val);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (this.currentSuggestion) {
        const input = this.cmdInput.nativeElement;
        input.value = this.currentSuggestion;
        this.updateSuggestion();
        input.setSelectionRange(input.value.length, input.value.length);
        this.analytics.trackEvent('AUTOCOMPLETE_ACCEPTED', `Accepted autocomplete suggestion "${this.currentSuggestion}"`, 'INTERACTION');
      }
      return;
    }
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }
}
