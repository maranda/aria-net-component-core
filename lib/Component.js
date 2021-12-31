"use strict";

const { parseURI } = require("@xmpp/connection/lib/util");
const Connection = require("@xmpp/connection-tcp");
const crypto = require("crypto");
const tls = require("tls");
const xml = require("@xmpp/xml");

/*
 * References
 * https://xmpp.org/extensions/xep-0114.html done
 * https://xmpp.org/extensions/xep-0225.html) todo
 */

const NS = "jabber:component:accept";

class Component extends Connection {
  socketParameters(service) {
    const params = super.socketParameters(service);
    params.port = params.port || 5347;
    return params;
  }

  // https://xmpp.org/extensions/xep-0114.html#example-4
  send(el) {
    // All stanzas sent to the server MUST possess a 'from' attribute and a 'to' attribute, as in the 'jabber:server' namespace
    if (this.isStanza(el) && !el.attrs.from) {
      el.attrs.from = this.jid.toString();
    }

    return super.send(el);
  }

  // https://xmpp.org/extensions/xep-0114.html#example-3
  async authenticate(id, password) {
    const hash = crypto.createHash("sha1");
    hash.update(id + password, "binary");
    const el = await this.sendReceive(xml("handshake", {}, hash.digest("hex")));
    if (el.name !== "handshake") {
      throw new Error("Unexpected server response");
    }

    this._jid(this.options.domain);
    this._status("online", this.jid);
  }
}

class ComponentTLS extends Connection {
  socketParameters(service) {
    const { port, hostname, protocol } = parseURI(service);
    return protocol === "xmpps:"
      ? { port: Number(port) || 5348, host: hostname }
      : undefined;
  }

  // https://xmpp.org/extensions/xep-0114.html#example-4
  send(el) {
    // All stanzas sent to the server MUST possess a 'from' attribute and a 'to' attribute, as in the 'jabber:server' namespace
    if (this.isStanza(el) && !el.attrs.from) {
      el.attrs.from = this.jid.toString();
    }

    return super.send(el);
  }

  // https://xmpp.org/extensions/xep-0114.html#example-3
  async authenticate(id, password) {
    const hash = crypto.createHash("sha1");
    hash.update(id + password, "binary");
    const el = await this.sendReceive(xml("handshake", {}, hash.digest("hex")));
    if (el.name !== "handshake") {
      throw new Error("Unexpected server response");
    }

    this._jid(this.options.domain);
    this._status("online", this.jid);
  }
}

Component.NS = NS;
Component.prototype.NS = NS;
ComponentTLS.NS = NS;
ComponentTLS.prototype.NS = NS;
ComponentTLS.prototype.Socket = tls.TLSSocket;

module.exports.Component = Component;
module.exports.ComponentTLS = ComponentTLS;
