variable "aws_region" {

  description =
    "AWS region used by the cold-chain project"

  type =
    string

  default =
    "eu-north-1"
}


variable "dynamodb_table_name" {

  description =
    "Terraform-managed cold-chain DynamoDB table"

  type =
    string

  default =
    "umar-coldchain-database-terraform"
}


variable "link_dynamodb_lambda_name" {

  description =
    "Main API Lambda function"

  type =
    string

  default =
    "umar-coldchain-LinkDynamoDB-terraform"
}


variable "link_dynamodb_role_name" {

  description =
    "IAM role for the main API Lambda"

  type =
    string

  default =
    "umar-coldchain-LinkDynamoDB-role-terraform"
}


variable "excursion_handler_lambda_name" {

  description =
    "Excursion processing Lambda function"

  type =
    string

  default =
    "umar-coldchain-excursion-handler-terraform"
}


variable "excursion_handler_role_name" {

  description =
    "IAM role for the excursion Lambda"

  type =
    string

  default =
    "umar-coldchain-excursion-handler-role-terraform"
}


variable "api_name" {

  description =
    "HTTP API Gateway name"

  type =
    string

  default =
    "umar-coldchain-api-terraform"
}


variable "sns_topic_name" {

  description =
    "SNS topic used for excursions"

  type =
    string

  default =
    "umar-coldchain-excursions-terraform"
}


variable "sqs_queue_name" {

  description =
    "Main excursion SQS queue"

  type =
    string

  default =
    "umar-coldchain-alert-queue-terraform"
}


variable "sqs_dlq_name" {

  description =
    "Excursion dead-letter queue"

  type =
    string

  default =
    "umar-coldchain-alert-dlq-terraform"
}


variable "lambda_runtime" {

  type =
    string

  default =
    "nodejs22.x"
}


variable "main_lambda_timeout" {

  type =
    number

  default =
    10
}


variable "excursion_lambda_timeout" {

  type =
    number

  default =
    5
}


variable "sqs_visibility_timeout" {

  type =
    number

  default =
    30
}


variable "sqs_max_receive_count" {

  type =
    number

  default =
    3
}


variable "cloudwatch_retention_days" {

  type =
    number

  default =
    14
}