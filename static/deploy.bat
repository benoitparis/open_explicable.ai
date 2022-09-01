cd /D "%~dp0"
aws s3 sync . s3://explicable.ai --acl public-read
