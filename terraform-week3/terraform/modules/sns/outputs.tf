output "topic_arn" {
  description = "ARN of the excursion SNS topic"
  value       = aws_sns_topic.excursions.arn
}

output "topic_name" {
  description = "Name of the excursion SNS topic"
  value       = aws_sns_topic.excursions.name
}