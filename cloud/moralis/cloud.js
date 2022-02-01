const logger = Moralis.Cloud.getLogger();
// logger.info(JSON.stringify(error))
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saterday', 'sunday'];

Moralis.Cloud.define("putUser", async (request) => {
  const config = await Moralis.Config.get({useMasterKey: true});
  const upstashBearerToken = config.get("upstashBearerToken");

  let commands = [["SADD", "avax", request.params.address.toString()]]
  let commandProfileHash = ["HSET", `u:${request.params.address.toString()}`]
  
  for (const [key, value] of Object.entries(request.params)) {
  	if (key.toString() !== "address" && !!value) {
    	commandProfileHash.push(key, value)
    }
  }
  
  commands.push(commandProfileHash)
  
  days.map((day) => {
    if (request.params[day]) {
      if (!!request.params.email) {
        commands.push(["ZADD", `mail:${day}`, request.params.mailTime, request.params.address.toString()])
      } else {
        commands.push(["ZREM", `mail:${day}`, request.params.address.toString()])
      }
      
      if (!!request.params.webPush) {
        commands.push(["ZADD", `webpush:${day}`, request.params.webPushTime, request.params.address.toString()])
      } else {
        commands.push(["ZREM", `webpush:${day}`, request.params.address.toString()])
      }
    } else {
      commands.push(["ZREM", `mail:${day}`, request.params.address.toString()])
      commands.push(["ZREM", `webpush:${day}`, request.params.address.toString()])
    }
  })
  
	let results = await upstashPipeline(commands)
    await updateProfileWalletPositions(request.params.address.toString())
});

Moralis.Cloud.define("deleteUser", async (request) => {
  const config = await Moralis.Config.get({useMasterKey: true});
  const upstashBearerToken = config.get("upstashBearerToken");
  let commands = [
    ["SREM", "avax", request.params.address.toString()],
    ["DEL", `u:${request.params.address.toString()}`],
    ["DEL", `tokens:${request.params.address.toString()}`]
  ]
  
  days.map((day) => {
    commands.push(["ZREM", `mail:${day}`, request.params.address.toString()])
    commands.push(["ZREM", `webpush:${day}`, request.params.address.toString()])
  })
  
  await upstashPipeline(commands)
});

Moralis.Cloud.define("getSubscriptions", async (request) => {
  let commands = [["HGETALL", `u:${request.params.address.toString()}`]]
  let upstashResult = await upstashPipeline(commands)
  let profilePairs = upstashResult[0].result;
  let subscriptions = {};
  profilePairs.map((profileKey, index) => {
    if (index % 2 === 0 && profileKey.startsWith('d:')) {
      subscriptions[profileKey.slice(2)]= profilePairs[index + 1]
  	}
    if (index % 2 === 0 && profileKey === 'positions') {
      subscriptions['positions']= JSON.parse(profilePairs[index + 1])
    }
  })
  return Array.isArray(upstashResult) ? subscriptions : {"error": JSON.stringify(upstashResult)}
});

Moralis.Cloud.define("updateSubscription", async (request) => {
  let commands = [
    ["HSET", `u:${request.params.address.toString()}`, `d:${request.params.domain.toString()}`, request.params.optin.toString()]
  ]
  let upstashResult = await upstashPipeline(commands)
  return Array.isArray(upstashResult) ? upstashResult[0].result : {"error": JSON.stringify(upstashResult)}
});

Moralis.Cloud.define("getDomains", async (request) => {
  let commands = [["ZRANGEBYSCORE", `domains:${request.params.address.toString()}`, "-inf", "+inf", "WITHSCORES"]]
  let upstashResult = await upstashPipeline(commands)
  return Array.isArray(upstashResult) ? upstashResult[0].result : {"error": JSON.stringify(upstashResult)}
});

Moralis.Cloud.define("getVerifiedDomains", async (request) => {
  let commands = [["ZRANGEBYSCORE", `domains:${request.params.address.toString()}`, "1", "+inf"]]
  let upstashResult = await upstashPipeline(commands)
  return Array.isArray(upstashResult) ? upstashResult[0].result : {"error": JSON.stringify(upstashResult)}
});

// Works only for one domain now, hackathon stress :P
// TODO: Make it work for multiple domains
Moralis.Cloud.define("getAnalytics", async (request) => {
  let command = ["ZRANGEBYSCORE", `domains:${request.params.address.toString()}`, "2", "+inf"]
  let upstashResult = await upstash(command)
  if (upstashResult.length) {
    let commands = []
    upstashResult.map((domain) => {
      ['s', 'p', 'l', 'v', 'g']
        .map((notificationType) => {
        return ['i', 'b', 'd'].map(
          (notificationLevel) => `${notificationType}${notificationLevel}:${domain}`
        );
      })
        .flat().map((key) => {
        commands.push(["SCARD", key])
      });
    })
    analyticsResult = await upstashPipeline(commands)
  	return [{domain: upstashResult, analytics: analyticsResult}]
  } else {
    return []
  }
});

Moralis.Cloud.define("addDomain", async (request) => {
  let commands = [
    ["ZADD", `domains:${request.params.address.toString()}`, "NX", 0, request.params.projectDomain.toString()],
    ["ZADD", "domains", "NX", 0, request.params.projectDomain.toString()],
    ["HSET", `domains:${request.params.projectDomain.toString()}`, request.params.address.toString(), 0]
  ]
  let upstashResult = await upstashPipeline(commands)
  return Array.isArray(upstashResult) ? [{"domain": request.params.projectDomain.toString(), admins: 0}] : {"error": JSON.stringify(upstashResult)}
});

Moralis.Cloud.define("deleteDomain", async (request) => {
  let commands = [["ZREM", `domains:${request.params.address.toString()}`, request.params.projectDomain.toString()]]
  let upstashResult = await upstashPipeline(commands)
  return Array.isArray(upstashResult) ? upstashResult[0].result : {"error": JSON.stringify(upstashResult)}
});

Moralis.Cloud.define("verifyDomain", async (request) => {
  let result = await getSnowflakesTXTRecords(request.params.projectDomain.toString());
  if (!result) {
    let commands = [
        ["ZINCRBY", "domains", -1, request.params.projectDomain.toString()]
      ]
    let upstashResult = await upstashPipeline(commands);
    return {"error": "No TXT records found"};
  }
  try {
  	let walletAddresses = result
    	.map((record) => record && record.data && record.data.slice(1,-1))
    	.filter(record => record.startsWith("snowflakes-network-member="))
    	.map(record => record.split("=")[1])
    	.filter((address) => address.startsWith("0x") && address.length === 42);
    
    let commands = [];
    
    if (walletAddresses.length){
      	walletAddresses.map((address) => {
        	commands = commands.concat([
              ["ZADD", `domains:${address.toString()}`, "XX", 1, request.params.projectDomain.toString()],
              ["ZADD", "domains", "XX", 1, request.params.projectDomain.toString()],
              ["HSET", `domains:${request.params.projectDomain.toString()}`, address.toString(), 1]
            ])
        });
      let upstashResult = await upstashPipeline(commands)
      return upstashResult
    } else {
      commands = commands.concat([
        ["ZINCRBY", "domains", -1, request.params.projectDomain.toString()]
      ])
      await upstashPipeline(commands)
      return []
    }
  } catch(error) {
  	return []
  }
});

async function upstashPipeline(commands){
  const config = await Moralis.Config.get({useMasterKey: true});
  const upstashBearerToken = config.get("upstashBearerToken");

  let result = await Moralis.Cloud.httpRequest({
    method: 'POST',
    url: 'https://eu1-present-bull-34198.upstash.io/pipeline',
    body: JSON.stringify(commands),    
    headers: {
      'Authorization': 'Bearer ' + upstashBearerToken
    }
  }).then(function(httpResponse) {
    return httpResponse.data
  }, function(httpResponse) {
 	return httpResponse
  });  
  return result;
}

async function upstash(command){
  const config = await Moralis.Config.get({useMasterKey: true});
  const upstashBearerToken = config.get("upstashBearerToken");

  let result = await Moralis.Cloud.httpRequest({
    method: 'POST',
    url: 'https://eu1-present-bull-34198.upstash.io',
    body: JSON.stringify(command),    
    headers: {
      'Authorization': 'Bearer ' + upstashBearerToken
    }
  }).then(function(httpResponse) {
    return httpResponse.data.result
  }, function(httpResponse) {
 	return httpResponse
  });  
  return result;
}

async function getSnowflakesTXTRecords(domain){
  let result = await Moralis.Cloud.httpRequest({
    method: 'GET',
    url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=TXT`,
    headers: {
      'Accept': 'application/dns-json'
    }
  }).then(function(httpResponse) {
    return httpResponse.data.Answer
  }, function(httpResponse) {
 	return httpResponse
  });  
  return result;
}

async function getWalletPositions(address) {
  const config = await Moralis.Config.get({useMasterKey: true});
  const covalentToken = config.get("covalentToken");
  
  let result = await Moralis.Cloud.httpRequest({
    method: 'GET',
    url: `https://api.covalenthq.com/v1/43114/address/${address}/balances_v2/?key=${covalentToken}`
  }).then(function(httpResponse) {
    return httpResponse.data.data.items.map((coin) => [coin.contract_address, coin.quote])
  }, function(httpResponse) {
 	return httpResponse
  });  
  return result;
}

async function updateProfileWalletPositions(address) {
  let contractDomain = await upstash(["HGETALL", "contract:domain"]);
  contractDomain = chunkTwoObject(contractDomain)
  let commands = [];
  let positions = await getWalletPositions(address);
  if(positions.length) {
    positions = positions.map((position) => {
      if (contractDomain[position[0]]) {
        commands.push(["HSETNX", `u:${address}`, `d:${contractDomain[position[0]]}`, 'sivbgbpblb'])
        return [contractDomain[position[0]], position[1]]
      } else {
        logger.info(`Missing contract mapping: ${position[0]}`)
      }
    }).filter((entry) => !!entry)
    commands.push(["HSET", `u:${address}`, 'positions', JSON.stringify(positions)])
  }
  await upstashPipeline(commands);
}

function chunkTwoObject(arr){
	return Object.fromEntries(
      [...Array(Math.ceil(arr.length / 2))].map((_) => arr.splice(0, 2))
    )
}

Moralis.Cloud.job("notificationsOrder", async (request) =>  {
  const { params, headers, log, message } = request;
  message("Start profile notifications order");
  let addresses = await upstash(["SMEMBERS", "avax"]);
  let contractDomain = await upstash(["HGETALL", "contract:domain"]);
  contractDomain = chunkTwoObject(contractDomain)
  let commands = [];
  addresses.map(async (address, index) => {
  	let positions = await getWalletPositions(address);
    if(positions.length) {
      positions = positions.map((position) => {
        if (contractDomain[position[0]]) {
          commands.push(["HSETNX", `u:${address}`, `d:${contractDomain[position[0]]}`, 'sivbgbpblb'])
          return [contractDomain[position[0]], position[1]]
        } else {
          logger.info(`Missing contract mapping: ${position[0]}`)
        }
      }).filter((entry) => !!entry)
      commands.push(["HSET", `u:${address}`, 'positions', JSON.stringify(positions)])
    }
    if(addresses.length === index + 1){
      await upstashPipeline(commands);
      message(`Profile notifications order job done: result`)
    }
  })
});

Moralis.Cloud.job("verifyDomains", async (request) =>  {
  const { params, headers, log, message } = request;
  message("Start verify domains job");
  let getUnverifiedDomainsCommand = [["ZRANGEBYSCORE", "domains", "-inf", 0]];
  let upstashResult = await upstashPipeline(getUnverifiedDomainsCommand);
  let unverifiedDomains = upstashResult[0].result;
  
  unverifiedDomains.map(async (domain) => {
    let result = await getSnowflakesTXTRecords(domain);
	if (!result) {
      await upstashPipeline([["ZINCRBY", "domains", -1, domain]]);
  	}
    try {
      let walletAddresses = result
          .map((record) => record && record.data && record.data.slice(1,-1))
          .filter(record => record.startsWith("snowflakes-network-member="))
          .map(record => record.split("=")[1])
          .filter((address) => address.startsWith("0x") && address.length === 42);

      let commands = [];

      if (walletAddresses.length){
          walletAddresses.map((address) => {
              commands = commands.concat([
                ["ZADD", `domains:${address.toString()}`, "XX", 1, domain],
                ["ZADD", "domains", "XX", 1, domain],
                ["HSET", `domains:${domain}`, address.toString(), 1]
              ])
          });
      } else {
        commands = commands.concat([
          ["ZINCRBY", "domains", -1, domain]
        ])
      }
      await upstashPipeline(commands)
    } catch(error) {
      return []
    }
  })
  message("Verify domains job done");
});

Moralis.Cloud.job("cleanOldNotifications", async (request) =>  {
  const { params, headers, log, message } = request;
  message("Start clean old notifications job");
  const now = new Date()  
  const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)  
  const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000)  
  const utcSecondsSinceEpoch7DaysAgo = utcSecondsSinceEpoch - (7 * 60 * 60 * 24)
  let cleanCommand = [["ZREMRANGEBYSCORE", "notifications", "-inf", utcSecondsSinceEpoch7DaysAgo]];
  let upstashResult = await upstashPipeline(cleanCommand);
  message(`Clean old notifications job done: result ${upstashResult[0].result}`);
});

Moralis.Cloud.job("mailTrigger", async (request) =>  {
  const { params, headers, log, message } = request;
  message("Start mailing job");
    
  const config = await Moralis.Config.get({useMasterKey: true});
  const snowflakesToken = config.get("snowflakesToken");

  let result = await Moralis.Cloud.httpRequest({
    method: 'POST',
    url: 'https://snowflakes.network/api/cron/mail.json',
    body: JSON.stringify({}),    
    headers: {
      'Authorization': 'Bearer ' + snowflakesToken
    }
  }).then(function(httpResponse) {
    return httpResponse
  }, function(httpResponse) {
 	return httpResponse
  });  
  message(`mailing job done`);
});


