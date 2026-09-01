resource "aws_sns_topic" "excursions" {
  name = var.sns_topic_name
}

resource "aws_sns_topic_subscription" "excursion_to_sqs" {
  topic_arn            = aws_sns_topic.excursions.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.alert_queue.arn
  raw_message_delivery = true

  depends_on = [
    aws_sqs_queue_policy.allow_sns
  ]
}