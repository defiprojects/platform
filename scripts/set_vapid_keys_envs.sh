#!/bin/bash

keypair=( $(node ./scripts/generate_vapid_keys.js | grep -w "[[:graph:]]\{43,87\}") )

for key in $keypair
do
    if [ ${#key} -lt 44 ]; then
        export VITE_VAPID_PRIVATE_KEY=$(echo $key)
        echo "Private vapid key env set: \n $key"
    else
        export VITE_VAPID_PUBLIC_KEY=$(echo $key)
        echo "Public vapid key env set: \n $key"
    fi
done
