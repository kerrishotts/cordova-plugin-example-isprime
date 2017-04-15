module.exports = {
    "plugins": [ "." ],
    "platform": "windows",
    "action": "run",
    "args": "--archs=x64 -- --appx=uap",
    "verbose": true,
    "cleanUpAfterRun": true,
    "logMins": 5
}

