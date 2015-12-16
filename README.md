## DevOps Milestone 3 - Deployment

    Divya Jain (djain2)
    Prashant Gupta (pgupta7)
    Shrenik Gala (sngala)

### Introduction

For this milestone, we have created instances on Amazon Web services that would act as different servers, where our code is deployed.
* Instance 1: Production Server
* Instance 2: Canary Server
* LocalHost: Proxy Server
* Instance 3: Global Redis Server

For automatically configuring the production environment, We have used Ansible as the Configuration Management Tool and Jenkins as the Build Server. We have created a sample node js app and added Mocha Tests and PMD Analysis to it. 

### Tasks

#### Automatic configuration of production environment & remote deployment
* We have used Jenkins as the Build Server and configured a job to track the local git repository for our node js application. Jenkins configuration files are present
* We have used Mocha testing for node js app and PMD for static analysis., as used in earlier milestones.
* There is a post-commit hook which triggers an automatic build in Jenkins. If the build fails due to test failure, the repo gets reset to previous stable commit.
* We have used ansible as the configuration management tool which specifies the inventory file for the production servers, both canary and prod, and Jenkins invokes a playbook with this inventory to push the respective code in the respective environments.For this, we have used the *Ansible Jenkins plugin*

The screencast is as follows:
![Image of screenshot](https://github.ncsu.edu/djain2/DevOps-M3/blob/master/screencasts/DevOpsM3-Part1.gif)
 

#### Feature Flags
* We have used a Global Redis Store to maintain the value of feature flag setting. We used an AWS instance as the Redis Server by installing Redis as follows `apt-get install redis-server`. Further modified the file `/etc/redis/redis.conf` and updated the value `bind 127.0.0.1` to `bind 0.0.0.0` to set up remote access to redis server on port 6379
* By default, the feature flag would be set to true, thus giving access to set/get functionality on prod server
* We are using latency as the parameter for setting the feature flag false if the latency is higher than the threshhold specified.
* Every request sent to the server would toggle the flag value, thereby enabling or disabling the feature in production

The screencast is as follows:
![Image of screenshot](https://github.ncsu.edu/djain2/DevOps-M3/blob/master/screencasts/DevOpsM3-Part2.gif)

#### Metrics and alerts
* We are monitoring two metrics - `CPU Utilization and Latency`using our understanding of the monitoring tool during the monitoring workshop.
* We have configured the Amazon simple email  server by following the steps mentioned on the AWS site, for the ability to send email notifications when the metrics for latency exceed threshold value.

The screencast is as follows:
![Image of screenshot](https://github.ncsu.edu/djain2/DevOps-M3/blob/master/screencasts/DevOpsM3-Part3.gif)

#### Canary releasing
* We have created another AWS instance that would be used as a Canary Server. The respective code with an additional functionality reserved for the canary server is pushed when the playbook is invoked.
* Canary Release - For the canary feature, we have included a '/slow' route which is not visible in the normal production server. 
* We created an http proxy server on localhost that would handle routing to Production and Canary Servers in the ratio of 3:1 i.e. 75% requests routed to Production server and 25% requests routed to Canary Server. 
* Further, we are using the feature flag from the redis store to determine the alert for the canary routing too. Hence if the latency is increased beyond the threshhold, which toggles the functionality of the feature flag off and sets the flag value to false in redis store, it means the routing to the canary server is stopped. Hence If alert is true, then traffic will be routed to Production server instead of Canary, thus sending all requests to only Production

The screencast is as follows:
![Image of screenshot](https://github.ncsu.edu/djain2/DevOps-M3/blob/master/screencasts/DevOpsM3-Part4.gif)
