#!/bin/bash

# any future command that fails will exit the script
set -e
# Lets write the public key of our aws instance
eval $(ssh-agent -s)
echo "$IFG_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null

echo "ARGS: $@"

# ** Alternative approach
# echo -e "$IFG_PRIVATE_KEY" > /root/.ssh/id_rsa
# chmod 600 /root/.ssh/id_rsa
# ** End of alternative approach

# disable the host key checking.
./ci/bin/disableHostKeyChecking.sh

# we have already setup the DEPLOYER_SERVER in our gitlab settings which is a
# comma seperated values of ip addresses.
LOCAL_DEPLOY_SERVERS=$IFG_DEPLOY_SERVERS

# lets split this string and convert this into array
# In UNIX, we can use this commond to do this
# ${string//substring/replacement}
# our substring is "," and we replace it with nothing.
ALL_SERVERS=(${LOCAL_DEPLOY_SERVERS//,/ })
echo "--> ALL_SERVERS ${ALL_SERVERS}"

# Lets iterate over this array and ssh into each EC2 instance
# Once inside.
# 1. Stop the server
# 2. Take a pull
# 3. Start the server
for server in "${ALL_SERVERS[@]}"
do
  echo "--> Copy docker-compose file to server"
  scp -r ./ci/bin/api-server/* ubuntu@${server}:~/mtt-source/api-server/

  echo "--> Sleep 5s"
  sleep 5s

  echo "deploying to ${server} with args: $@"
  ssh ubuntu@${server} 'bash -s' < ./ci/bin/updateAndRestart.sh $@
done
