terraform {
  backend "s3" {
    bucket         = "microservices-amazon"
    key            = "project/app/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
