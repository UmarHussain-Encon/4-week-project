terraform {
  backend "s3" {
    bucket         = "4-week-umar-terraform-remote-state"
    key            = "coldchain/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    dynamodb_table = "4-week-umar-terraform-state-lock"
  }
}