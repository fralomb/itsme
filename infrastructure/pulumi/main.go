package main

import (
	"encoding/json"

	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/s3"
	"github.com/pulumi/pulumi-cloudflare/sdk/v5/go/cloudflare"
	synced "github.com/pulumi/pulumi-synced-folder/sdk/go/synced-folder"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create an AWS resource (S3 Bucket)
		bucket, err := s3.NewBucketV2(ctx, "itsme-website", &s3.BucketV2Args{
			Bucket: pulumi.String("francesco-lombardo.it"),
			Acl:    s3.CannedAclPublicRead,
		})
		if err != nil {
			return err
		}

		bucketWebsite, err := s3.NewBucketWebsiteConfigurationV2(ctx, "itsme-website", &s3.BucketWebsiteConfigurationV2Args{
			Bucket: bucket.Bucket,
			IndexDocument: s3.BucketWebsiteConfigurationV2IndexDocumentArgs{
				Suffix: pulumi.String("index.html"),
			},
			// ErrorDocument: s3.BucketWebsiteConfigurationV2ErrorDocumentArgs{
			// 	Key: pulumi.String(errorDocument),
			// },
		})
		if err != nil {
			return err
		}

		// Set ownership controls for the new S3 bucket
		ownershipControls, err := s3.NewBucketOwnershipControls(ctx, "ownership-controls", &s3.BucketOwnershipControlsArgs{
			Bucket: bucket.Bucket,
			Rule: &s3.BucketOwnershipControlsRuleArgs{
				ObjectOwnership: pulumi.String("ObjectWriter"),
			},
		})
		if err != nil {
			return err
		}

		// Configure public access block for the new S3 bucket
		publicAccessBlock, err := s3.NewBucketPublicAccessBlock(ctx, "public-access-block", &s3.BucketPublicAccessBlockArgs{
			Bucket:          bucket.Bucket,
			BlockPublicAcls: pulumi.Bool(false),
		})
		if err != nil {
			return err
		}

		_, err = s3.NewBucketPolicy(ctx, "bucket-policy", &s3.BucketPolicyArgs{
			Bucket: bucket.ID(),
			Policy: bucket.ID().ToStringOutput().ApplyT(func(bucketName string) (string, error) {
				policy := map[string]interface{}{
					"Version": "2012-10-17",
					"Statement": []interface{}{
						map[string]interface{}{
							"Sid":       "PublicReadGetObject",
							"Effect":    "Allow",
							"Principal": "*",
							"Action":    "s3:GetObject",
							"Resource":  "arn:aws:s3:::" + bucketName + "/*",
							"Condition": map[string]interface{}{
								"IpAddress": map[string]interface{}{
									"aws:SourceIp": []string{
										"173.245.48.0/20",
										"103.21.244.0/22",
										"103.22.200.0/22",
										"103.31.4.0/22",
										"141.101.64.0/18",
										"108.162.192.0/18",
										"190.93.240.0/20",
										"188.114.96.0/20",
										"197.234.240.0/22",
										"198.41.128.0/17",
										"162.158.0.0/15",
										"104.16.0.0/13",
										"104.24.0.0/14",
										"172.64.0.0/13",
										"131.0.72.0/22",
									},
								},
							},
						},
					},
				}
				policyJSON, err := json.Marshal(policy)
				return string(policyJSON), err
			}).(pulumi.StringOutput),
		}, pulumi.DependsOn([]pulumi.Resource{
			publicAccessBlock,
			ownershipControls,
		}))
		if err != nil {
			return err
		}

		// Use a synced folder to manage the files of the website.
		_, err = synced.NewS3BucketFolder(ctx, "app-folder", &synced.S3BucketFolderArgs{
			Path:       pulumi.String("./dist/app/browser"),
			BucketName: bucket.Bucket,
			Acl:        pulumi.String("public-read"),
		}, pulumi.DependsOn([]pulumi.Resource{ownershipControls, publicAccessBlock, bucketWebsite}))
		if err != nil {
			return err
		}

		// Setup Cloudflare DNS record
		cf_zone, err := cloudflare.LookupZone(ctx, &cloudflare.LookupZoneArgs{
			Name: pulumi.StringRef("francesco-lombardo.it"),
		}, nil)
		if err != nil {
			return err
		}
		_, err = cloudflare.NewRecord(ctx, "root", &cloudflare.RecordArgs{
			ZoneId:  pulumi.String(cf_zone.Id),
			Name:    pulumi.String("@"),
			Content: bucketWebsite.WebsiteEndpoint,
			Type:    pulumi.String("CNAME"),
			Proxied: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		// Export the name of the bucket
		ctx.Export("bucketName", bucket.ID())
		ctx.Export("bucketHostname", bucketWebsite.WebsiteEndpoint)
		return nil
	})
}
