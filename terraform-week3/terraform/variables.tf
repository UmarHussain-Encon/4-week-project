variable "aws_region" {
  description = "AWS region used by the cold-chain project"
  type        = string
  default     = "eu-north-1"
}


# ======================================================
# DATABASE
# ======================================================


variable "dynamodb_readings_table_name" {
  description = "New readingId-based DynamoDB table"
  type        = string
  default     = "umar-coldchain-readings-terraform"
}


variable "readings_gsi_name" {
  description = "Index used to query readings by branch and recordedAt"
  type        = string
  default     = "branch-recordedAt-index"
}


# ======================================================
# MAIN LAMBDA
# ======================================================

variable "link_dynamodb_lambda_name" {
  description = "Main API Lambda function"
  type        = string
  default     = "umar-coldchain-LinkDynamoDB-terraform"
}


variable "link_dynamodb_role_name" {
  description = "IAM execution role for the main Lambda"
  type        = string
  default     = "umar-coldchain-LinkDynamoDB-role-terraform"
}


# ======================================================
# EXCURSION LAMBDA
# ======================================================

variable "excursion_handler_lambda_name" {
  description = "Excursion processing Lambda"
  type        = string
  default     = "umar-coldchain-excursion-handler-terraform"
}


variable "excursion_handler_role_name" {
  description = "IAM execution role for the excursion Lambda"
  type        = string
  default     = "umar-coldchain-excursion-handler-role-terraform"
}


# ======================================================
# API
# ======================================================

variable "api_name" {
  description = "REST API Gateway name"
  type        = string
  default     = "umar-coldchain-api-terraform"
}


variable "api_stage_name" {
  description = "REST API deployment stage"
  type        = string
  default     = "dev"
}


# ======================================================
# SNS / SQS
# ======================================================

variable "sns_topic_name" {
  description = "SNS excursion topic"
  type        = string
  default     = "umar-coldchain-excursions-terraform"
}


variable "sqs_queue_name" {
  description = "Main excursion SQS queue"
  type        = string
  default     = "umar-coldchain-alert-queue-terraform"
}


variable "sqs_dlq_name" {
  description = "Excursion dead-letter queue"
  type        = string
  default     = "umar-coldchain-alert-dlq-terraform"
}


# ======================================================
# LAMBDA SETTINGS
# ======================================================

variable "lambda_runtime" {
  description = "Node.js Lambda runtime"
  type        = string
  default     = "nodejs22.x"
}


variable "main_lambda_timeout" {
  description = "Main API Lambda timeout"
  type        = number
  default     = 10
}


variable "excursion_lambda_timeout" {
  description = "Excursion Lambda timeout"
  type        = number
  default     = 5
}


# ======================================================
# SQS SETTINGS
# ======================================================

variable "sqs_visibility_timeout" {
  description = "Main queue visibility timeout"
  type        = number
  default     = 30
}


variable "sqs_max_receive_count" {
  description = "Failed receives before DLQ"
  type        = number
  default     = 3
}


# ======================================================
# CLOUDWATCH
# ======================================================

variable "cloudwatch_retention_days" {
  description = "CloudWatch log retention"
  type        = number
  default     = 14
}