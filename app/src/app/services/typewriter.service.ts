import { Injectable, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

interface TextNode {
  type: 'text';
  content: string;
  parentTags: string[];
}

interface TypedChar {
  char: string;
  tags: string[];
}

interface TextSequence {
  key: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypewriterService {
  private fastForwardSpeed = 5; // Very fast speed for fast-forward mode (5ms)
  private isFastForwardMode = false;
  private activeObservers: any[] = [];

  constructor() { }

  // Enable fast-forward mode for all active and future animations
  enableFastForward() {
    this.isFastForwardMode = true;
    // Trigger fast-forward on all currently active observers
    this.activeObservers.forEach(observer => {
      if (observer.fastForward) {
        observer.fastForward(this.fastForwardSpeed);
      }
    });
  }

  // Reset fast-forward mode (for future animations)
  resetFastForward() {
    this.isFastForwardMode = false;
    this.activeObservers = [];
  }

  typeText(elem: ElementRef, speed: number = 100): Observable<any> {
    const htmlString: string = elem.nativeElement.innerHTML;
    const textNodes = this.parseHtml(htmlString);
    let allCharacters: TypedChar[] = [];

    // Prepare all characters with their corresponding tags
    textNodes.forEach(node => {
      const chars = node.content.split('');
      chars.forEach(char => {
        allCharacters.push({
          char,
          tags: node.parentTags
        });
      });
    });

    return new Observable<any>(observer => {
      let currentIndex = 0;
      let intervalId: any;
      let currentSpeed = this.isFastForwardMode ? this.fastForwardSpeed : speed;

      // Method to skip the animation (instant completion)
      const skip = () => {
        if (intervalId) {
          clearInterval(intervalId);
          // Emit the full content
          const fullHTML = this.buildHTMLFromChars(allCharacters);
          observer.next({
            message: fullHTML,
            elem: elem,
            isFirstChar: currentIndex === 0,
            skipped: true
          });
          observer.complete();
        }
      };

      // Method to fast-forward the animation (very fast typing)
      const fastForward = (newSpeed: number = 5) => {
        if (intervalId && currentIndex < allCharacters.length) {
          clearInterval(intervalId);
          currentSpeed = newSpeed;

          // Restart interval with faster speed
          intervalId = setInterval(() => {
            if (currentIndex < allCharacters.length) {
              const currentChars = allCharacters.slice(0, currentIndex + 1);
              const currentHTML = this.buildHTMLFromChars(currentChars);

              observer.next({
                message: currentHTML,
                elem: elem,
                isFirstChar: false,
                skipped: false
              });

              currentIndex++;
            } else {
              clearInterval(intervalId);
              // Remove from active observers when complete
              const index = this.activeObservers.indexOf(observer);
              if (index > -1) {
                this.activeObservers.splice(index, 1);
              }
              observer.complete();
            }
          }, currentSpeed);
        }
      };

      // Store skip and fastForward functions in observer for external access
      (observer as any).skip = skip;
      (observer as any).fastForward = fastForward;

      // Register this observer as active
      this.activeObservers.push(observer);

      intervalId = setInterval(() => {
        if (currentIndex < allCharacters.length) {
          // Get all characters up to the current index
          const currentChars = allCharacters.slice(0, currentIndex + 1);
          const currentHTML = this.buildHTMLFromChars(currentChars);

          observer.next({
            message: currentHTML,
            elem: elem,
            isFirstChar: currentIndex === 0,
            skipped: false
          });

          currentIndex++;
        } else {
          clearInterval(intervalId);
          // Remove from active observers when complete
          const index = this.activeObservers.indexOf(observer);
          if (index > -1) {
            this.activeObservers.splice(index, 1);
          }
          observer.complete();
        }
      }, currentSpeed);

      // Return cleanup function
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        // Remove from active observers on cleanup
        const index = this.activeObservers.indexOf(observer);
        if (index > -1) {
          this.activeObservers.splice(index, 1);
        }
      };
    });
  }

  private buildHTMLFromChars(chars: TypedChar[]): string {
    // Group characters by their tag structure
    const tagGroups = new Map<string, string>();
    const textSequence = new Array<TextSequence>();

    // Build the HTML structure
    let html: string = "";
    chars.forEach((char: TypedChar, index: number) => {
      if (textSequence.length == 0) {
        textSequence.push({
          key: (char.tags.join('|') || ""),
          text: char.char
        });
      } else {
        // retrieve last item in the Array
        let last = textSequence[textSequence.length - 1];
        let key = (char.tags.join('|') || "");
        if (last.key === key) {
          // append char to existing item in the Array
          let newValue = last.text + char.char;
          textSequence[textSequence.length - 1] = {
            key: key,
            text: newValue
          };
        } else {
          textSequence.push({
            key: key,
            text: char.char
          });
        }
      }
    });

    textSequence.forEach((sequence: TextSequence) => {
      let sequenceContent = "";
      if(sequence.key !== "") {
        const keyTags = sequence.key.split('|')
        // add start tags
        for (let tag of keyTags) {
          sequenceContent += `<${tag}>`;
        }
        // add content
        sequenceContent += `${sequence.text}`;
        // add end tags
        for (let tag of keyTags) {
          const tagName = tag.split(' ')[0];
          sequenceContent += `</${tagName}>`;
        }
      } else {
        // add text content
        sequenceContent += `${sequence.text}`;
      }
      html += sequenceContent;
    });

    return html;
  }

  private parseHtml(htmlString: string): TextNode[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const textNodes: TextNode[] = [];

    const processNode = (node: Node, parentTags: string[] = []): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text) {
          textNodes.push({
            type: 'text',
            content: text,
            parentTags: [...parentTags]
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // Process child nodes with updated parent tags
        const newParentTags = [...parentTags, this.createTagString(element)];
        Array.from(element.childNodes).forEach(child => {
          processNode(child, newParentTags);
        });
      }
    };

    Array.from(doc.body.childNodes).forEach(node => processNode(node));
    return textNodes;
  }

  private createTagString(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const attributes = Array.from(element.attributes)
      .map(attr => ` ${attr.name}="${attr.value}"`)
      .join('');
    return `${tagName}${attributes}`;
  }
}
