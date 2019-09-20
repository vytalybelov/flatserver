class Node {
    constructor(ip_addr) {
        this.ip_addr = ip_addr; 
        this.mac_addr = '__:__:__:__:__:__'; 
        this.response_time = -1;
        this.isStateChanged = 0;
        this.is_online = false;
        this.name = '';
    }
};

module.exports = Node;
