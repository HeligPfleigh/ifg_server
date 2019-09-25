#!/bin/bash

# any future command that fails will exit the script
set -e

# access to work dir
echo "--> WORKDIR: ~/mtt-source/api-server";

echo "ARGS: $@"

######### DEPLOY PROCESS #############
deploy() {
  # stop docker-compose
  echo "Stop Socket Sever"

  # docker cli
  docker-compose stop

  # remove old instance
  docker-compose rm -f

  # update images of services
  docker-compose pull

  # rebuild and start compose
  docker-compose up -d --build
}

######### CHECK EXIST FOLDER ##########
directoryExists() {
  if [ ! -d "$1" ]; then
    echo "Project $1 does not exist"
    exit 1;
  fi
}

############ MAIN PROCESS #############
c=$1
shift;

# CD COMMAND
cd ~/mtt-source/api-server

case "$c" in
    ver1)
      directoryExists production-v1.0

      cd production-v1.0/
      # run
      deploy
    ;;

    ver2)
      directoryExists production-v2.0

      cd production-v2.0/
      # run
      deploy
    ;;

    production)
      # run
      deploy
    ;;

    *)
    echo $"Usage: $0 { ver1 | ver2 | production }"
    exit 1
esac
