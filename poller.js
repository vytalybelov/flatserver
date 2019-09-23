const dns = require('dns');
const arp = require('node-arp');
const ping = require ("net-ping");

const ping_options = {
    timeout: 1000
}
var session = ping.createSession(ping_options);

class Poller {
    constructor(nodes) {
        this._nodes = nodes;
        this._isRunning = false;
        this._offline_count = 0;
        this._online_count = 0;
    }

    start() {
        if(this._isRunning) return;
        this._isRunning = true;
        this._offline_count = 0;
        this._online_count = 0;
            
        for(var currNode = 0; currNode < this._nodes.length; currNode++) {
            const node = this._nodes[currNode];
            session.pingHost(node.ip_addr, (error, target, sent, rcvd) => {

                if (error) {
                    node.is_online = false;

                    if(node.time != -1) {
                        node.isStateChanged = 1;
                    } else {
                        node.isStateChanged = 0;
                    }

                    node.time = -1;
                    this._offline_count += 1;
 
                } else {
                    node.is_online = true;

                    if(node.time == -1) {
                        node.isStateChanged = 1;    
                    } else {
                        node.isStateChanged = 0;
                    }
                    
                    node.time = rcvd - sent;
                    this._online_count += 1;
                }
            });
        }

        for(let cPoller = 0; cPoller < this._nodes.length; cPoller++) {
            const node = this._nodes[cPoller];
            if (node.is_online) {
                arp.getMAC(node.ip_addr, (err, mac) => {
                    if (!err) {
                        node.mac = mac;
                    }
                });

                dns.reverse(node.ip_addr, (err, hostnames) => {
                    if (!err) {
                        if(hostnames.length > 0)
                            node.name = hostnames[0];
                        else
                            node.name = '[N/A]';    
                    }
                });
            }
        }

        this._isRunning = false;
    }       
}

module.exports = Poller;
