terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region  = "us-east-1"  # You can change this to your preferred region
  profile = "wisebeanz"  # This will use the named profile from your AWS credentials
}

# Create an IAM role for Amplify
resource "aws_iam_role" "amplify_role" {
  name = "amplify-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = ["amplify.amazonaws.com", "amplify.us-east-1.amazonaws.com"]
        }
      }
    ]
  })
}

# Create an IAM policy for Amplify
resource "aws_iam_role_policy" "amplify_policy" {
  name = "amplify-app-policy"
  role = aws_iam_role.amplify_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "amplify:*",
          "cloudformation:CreateStack",
          "cloudformation:DeleteStack",
          "cloudformation:UpdateStack",
          "cloudfront:CreateDistribution",
          "cloudfront:DeleteDistribution",
          "cloudfront:UpdateDistribution",
          "s3:CreateBucket",
          "s3:DeleteBucket",
          "s3:PutBucketPolicy",
          "s3:PutBucketWebsite",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "iam:PassRole",
          "iam:ListRoles",
          "iam:GetRole",
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy"
        ]
        Resource = "*"
      }
    ]
  })
}

# Create the Amplify app
resource "aws_amplify_app" "web_app" {
  name         = "wisebeanz"
  repository   = "https://github.com/CaelumTerrae/wisebeanz"
  
  # Add GitHub token
  access_token = var.github_access_token
  
  # Enable auto branch creation
  enable_auto_branch_creation = true
  enable_branch_auto_build   = true
  
  # Build settings
  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: out
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
  EOT

  # Environment variables
  environment_variables = {
    ENV = "production"
    NODE_ENV = "production"
  }

  # IAM service role
  iam_service_role_arn = aws_iam_role.amplify_role.arn
}

# Create a branch for the Amplify app
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.web_app.id
  branch_name = "main"
  
  framework = "React"
  stage     = "PRODUCTION"

  enable_auto_build = true
}

# Output the Amplify app URL
output "amplify_app_url" {
  value = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.web_app.default_domain}"
}
