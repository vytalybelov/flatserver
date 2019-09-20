const express = require('express');
const app = express();
app.set("view engine", "pug");
app.use(express.static(__dirname + '/public'));

var refresh_interval = 20; // in seconds
var Node = require('./node');
var Poller = require('./poller');
const NODES_COUNT = 64;
var nodes = new Array(NODES_COUNT);
var target_net = '192.168.8.'

for(var cNode = 0; cNode < NODES_COUNT; cNode++) {
    nodes[cNode] = new Node(target_net + String(cNode+1));
}

var poller = new Poller(nodes);
poller.start();
setInterval(() => {poller.start();}, refresh_interval * 1000);

const pug = require('pug');
const compiledPug = pug.compileFile('./views/nodes.pug');

app.use("/", (request, response) => {
     response.send(compiledPug({
        title: target_net,
        nodes: nodes,
        nodes_off: poller._offline_count,
        nodes_on: poller._online_count,
        refresh_interval: refresh_interval
    }));
 }); 
 
app.listen(3000);