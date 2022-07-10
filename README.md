# Description
This application helps rotate Elastic IP address of EC2 instances in AWS

# IAM Policy Permissions

```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "VisualEditor1",
        "Effect": "Allow",
        "Action": [
          "ec2:ReleaseAddress",
          "ec2:DisassociateAddress",
          "ec2:DescribeAddresses",
          "ec2:DescribeInstances",
          "ec2:AssociateAddress",
          "ec2:AllocateAddress"
        ],
        "Resource": "*"
      }
    ]
  }
```

# How to run
Execute this command:  
```js
node app.js <instance-id> <aws-region>
```