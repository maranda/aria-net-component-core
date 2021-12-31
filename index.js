"use strict";

const Component = require("./lib/Component").Component;
const ComponentTLS = require("./lib/Component").ComponentTLS;
const xml = require("@xmpp/xml");
const jid = require("@xmpp/jid");

module.exports.Component = Component;
module.exports.ComponentTLS = ComponentTLS;
module.exports.xml = xml;
module.exports.jid = jid;
