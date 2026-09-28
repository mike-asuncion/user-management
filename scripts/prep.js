fetch(process.env.npm_package_config_pingUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: process.env.npm_package_config_pingKey,
    project: process.env.npm_package_name,
    version: process.env.npm_package_version,
    event: "cms-start",
    platform: process.platform,
    node: process.version,
    time: new Date().toISOString()
  }),
  signal: AbortSignal.timeout(5000)
}).catch(function () {});
