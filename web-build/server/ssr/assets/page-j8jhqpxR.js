import { a as require_react, o as __commonJSMin, s as __toESM, t as require_jsx_runtime } from "../index.js";
import { _ as SHIPS, c as saveQualityPreference, d as AMMO, f as CANNONS, g as QUESTS, h as MAPS, i as GAMEPLAY_CAMERA_POLICY, m as ENTITY_DATA, o as loadQualityPreference, p as DECK_LEVELS, r as worldOffset, t as PLAYER_SHIP_VISUALS } from "./shipVisuals-CO8MoAPz.js";
//#region node_modules/ipaddr.js/lib/ipaddr.js
var require_ipaddr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(root) {
		"use strict";
		const ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
		const ipv4Regexes = {
			fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, "i"),
			threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, "i"),
			twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, "i"),
			longValue: new RegExp(`^${ipv4Part}$`, "i")
		};
		const octalRegex = new RegExp(`^0[0-7]+$`, "i");
		const hexRegex = new RegExp(`^0x[a-f0-9]+$`, "i");
		const zoneIndex = "%[0-9a-z]{1,}";
		const ipv6Part = "(?:[0-9a-f]+::?)+";
		const ipv6Regexes = {
			zoneIndex: new RegExp(zoneIndex, "i"),
			"native": new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, "i"),
			deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, "i"),
			transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, "i")
		};
		function expandIPv6(string, parts) {
			if (string.indexOf("::") !== string.lastIndexOf("::")) return null;
			let colonCount = 0;
			let lastColon = -1;
			let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0];
			let replacement, replacementCount;
			if (zoneId) {
				zoneId = zoneId.substring(1);
				string = string.replace(/%.+$/, "");
			}
			while ((lastColon = string.indexOf(":", lastColon + 1)) >= 0) colonCount++;
			if (string.substr(0, 2) === "::") colonCount--;
			if (string.substr(-2, 2) === "::") colonCount--;
			if (colonCount > parts) return null;
			replacementCount = parts - colonCount;
			replacement = ":";
			while (replacementCount--) replacement += "0:";
			string = string.replace("::", replacement);
			if (string[0] === ":") string = string.slice(1);
			if (string[string.length - 1] === ":") string = string.slice(0, -1);
			parts = (function() {
				const ref = string.split(":");
				const results = [];
				for (let i = 0; i < ref.length; i++) results.push(parseInt(ref[i], 16));
				return results;
			})();
			return {
				parts,
				zoneId
			};
		}
		function matchCIDR(first, second, partSize, cidrBits) {
			if (first.length !== second.length) throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
			let part = 0;
			let shift;
			while (cidrBits > 0) {
				shift = partSize - cidrBits;
				if (shift < 0) shift = 0;
				if (first[part] >> shift !== second[part] >> shift) return false;
				cidrBits -= partSize;
				part += 1;
			}
			return true;
		}
		function parseIntAuto(string) {
			if (hexRegex.test(string)) return parseInt(string, 16);
			if (string[0] === "0" && !isNaN(parseInt(string[1], 10))) {
				if (octalRegex.test(string)) return parseInt(string, 8);
				throw new Error(`ipaddr: cannot parse ${string} as octal`);
			}
			return parseInt(string, 10);
		}
		function padPart(part, length) {
			while (part.length < length) part = `0${part}`;
			return part;
		}
		const ipaddr = {};
		ipaddr.IPv4 = (function() {
			function IPv4(octets) {
				if (octets.length !== 4) throw new Error("ipaddr: ipv4 octet count should be 4");
				let i, octet;
				for (i = 0; i < octets.length; i++) {
					octet = octets[i];
					if (!(0 <= octet && octet <= 255)) throw new Error("ipaddr: ipv4 octet should fit in 8 bits");
				}
				this.octets = octets;
			}
			IPv4.prototype.SpecialRanges = {
				unspecified: [[new IPv4([
					0,
					0,
					0,
					0
				]), 8]],
				broadcast: [[new IPv4([
					255,
					255,
					255,
					255
				]), 32]],
				multicast: [[new IPv4([
					224,
					0,
					0,
					0
				]), 4]],
				linkLocal: [[new IPv4([
					169,
					254,
					0,
					0
				]), 16]],
				loopback: [[new IPv4([
					127,
					0,
					0,
					0
				]), 8]],
				carrierGradeNat: [[new IPv4([
					100,
					64,
					0,
					0
				]), 10]],
				"private": [
					[new IPv4([
						10,
						0,
						0,
						0
					]), 8],
					[new IPv4([
						172,
						16,
						0,
						0
					]), 12],
					[new IPv4([
						192,
						168,
						0,
						0
					]), 16]
				],
				reserved: [
					[new IPv4([
						192,
						0,
						0,
						0
					]), 24],
					[new IPv4([
						192,
						0,
						2,
						0
					]), 24],
					[new IPv4([
						192,
						88,
						99,
						0
					]), 24],
					[new IPv4([
						198,
						18,
						0,
						0
					]), 15],
					[new IPv4([
						198,
						51,
						100,
						0
					]), 24],
					[new IPv4([
						203,
						0,
						113,
						0
					]), 24],
					[new IPv4([
						240,
						0,
						0,
						0
					]), 4]
				],
				as112: [[new IPv4([
					192,
					175,
					48,
					0
				]), 24], [new IPv4([
					192,
					31,
					196,
					0
				]), 24]],
				amt: [[new IPv4([
					192,
					52,
					193,
					0
				]), 24]]
			};
			IPv4.prototype.kind = function() {
				return "ipv4";
			};
			IPv4.prototype.match = function(other, cidrRange) {
				let ref;
				if (cidrRange === void 0) {
					ref = other;
					other = ref[0];
					cidrRange = ref[1];
				}
				if (other.kind() !== "ipv4") throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
				return matchCIDR(this.octets, other.octets, 8, cidrRange);
			};
			IPv4.prototype.prefixLengthFromSubnetMask = function() {
				let cidr = 0;
				let stop = false;
				const zerotable = {
					0: 8,
					128: 7,
					192: 6,
					224: 5,
					240: 4,
					248: 3,
					252: 2,
					254: 1,
					255: 0
				};
				let i, octet, zeros;
				for (i = 3; i >= 0; i -= 1) {
					octet = this.octets[i];
					if (octet in zerotable) {
						zeros = zerotable[octet];
						if (stop && zeros !== 0) return null;
						if (zeros !== 8) stop = true;
						cidr += zeros;
					} else return null;
				}
				return 32 - cidr;
			};
			IPv4.prototype.range = function() {
				return ipaddr.subnetMatch(this, this.SpecialRanges);
			};
			IPv4.prototype.toByteArray = function() {
				return this.octets.slice(0);
			};
			IPv4.prototype.toIPv4MappedAddress = function() {
				return ipaddr.IPv6.parse(`::ffff:${this.toString()}`);
			};
			IPv4.prototype.toNormalizedString = function() {
				return this.toString();
			};
			IPv4.prototype.toString = function() {
				return this.octets.join(".");
			};
			return IPv4;
		})();
		ipaddr.IPv4.broadcastAddressFromCIDR = function(string) {
			try {
				const cidr = this.parseCIDR(string);
				const ipInterfaceOctets = cidr[0].toByteArray();
				const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
				const octets = [];
				let i = 0;
				while (i < 4) {
					octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
					i++;
				}
				return new this(octets);
			} catch (e) {
				throw new Error("ipaddr: the address does not have IPv4 CIDR format");
			}
		};
		ipaddr.IPv4.isIPv4 = function(string) {
			return this.parser(string) !== null;
		};
		ipaddr.IPv4.isValid = function(string) {
			try {
				new this(this.parser(string));
				return true;
			} catch (e) {
				return false;
			}
		};
		ipaddr.IPv4.isValidCIDR = function(string) {
			try {
				this.parseCIDR(string);
				return true;
			} catch (e) {
				return false;
			}
		};
		ipaddr.IPv4.isValidFourPartDecimal = function(string) {
			if (ipaddr.IPv4.isValid(string) && string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/)) return true;
			else return false;
		};
		ipaddr.IPv4.isValidCIDRFourPartDecimal = function(string) {
			const match = string.match(/^(.+)\/(\d+)$/);
			if (!ipaddr.IPv4.isValidCIDR(string) || !match) return false;
			return ipaddr.IPv4.isValidFourPartDecimal(match[1]);
		};
		ipaddr.IPv4.networkAddressFromCIDR = function(string) {
			let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
			try {
				cidr = this.parseCIDR(string);
				ipInterfaceOctets = cidr[0].toByteArray();
				subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
				octets = [];
				i = 0;
				while (i < 4) {
					octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
					i++;
				}
				return new this(octets);
			} catch (e) {
				throw new Error("ipaddr: the address does not have IPv4 CIDR format");
			}
		};
		ipaddr.IPv4.parse = function(string) {
			const parts = this.parser(string);
			if (parts === null) throw new Error("ipaddr: string is not formatted like an IPv4 Address");
			return new this(parts);
		};
		ipaddr.IPv4.parseCIDR = function(string) {
			let match;
			if (match = string.match(/^(.+)\/(\d+)$/)) {
				const maskLength = parseInt(match[2]);
				if (maskLength >= 0 && maskLength <= 32) {
					const parsed = [this.parse(match[1]), maskLength];
					Object.defineProperty(parsed, "toString", { value: function() {
						return this.join("/");
					} });
					return parsed;
				}
			}
			throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range");
		};
		ipaddr.IPv4.parser = function(string) {
			let match, part, value;
			if (match = string.match(ipv4Regexes.fourOctet)) return (function() {
				const ref = match.slice(1, 6);
				const results = [];
				for (let i = 0; i < ref.length; i++) {
					part = ref[i];
					results.push(parseIntAuto(part));
				}
				return results;
			})();
			else if (match = string.match(ipv4Regexes.longValue)) {
				value = parseIntAuto(match[1]);
				if (value > 4294967295 || value < 0) throw new Error("ipaddr: address outside defined range");
				return (function() {
					const results = [];
					let shift;
					for (shift = 0; shift <= 24; shift += 8) results.push(value >> shift & 255);
					return results;
				})().reverse();
			} else if (match = string.match(ipv4Regexes.twoOctet)) return (function() {
				const ref = match.slice(1, 4);
				const results = [];
				value = parseIntAuto(ref[1]);
				if (value > 16777215 || value < 0) throw new Error("ipaddr: address outside defined range");
				results.push(parseIntAuto(ref[0]));
				results.push(value >> 16 & 255);
				results.push(value >> 8 & 255);
				results.push(value & 255);
				return results;
			})();
			else if (match = string.match(ipv4Regexes.threeOctet)) return (function() {
				const ref = match.slice(1, 5);
				const results = [];
				value = parseIntAuto(ref[2]);
				if (value > 65535 || value < 0) throw new Error("ipaddr: address outside defined range");
				results.push(parseIntAuto(ref[0]));
				results.push(parseIntAuto(ref[1]));
				results.push(value >> 8 & 255);
				results.push(value & 255);
				return results;
			})();
			else return null;
		};
		ipaddr.IPv4.subnetMaskFromPrefixLength = function(prefix) {
			prefix = parseInt(prefix);
			if (prefix < 0 || prefix > 32) throw new Error("ipaddr: invalid IPv4 prefix length");
			const octets = [
				0,
				0,
				0,
				0
			];
			let j = 0;
			const filledOctetCount = Math.floor(prefix / 8);
			while (j < filledOctetCount) {
				octets[j] = 255;
				j++;
			}
			if (filledOctetCount < 4) octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8;
			return new this(octets);
		};
		ipaddr.IPv6 = (function() {
			function IPv6(parts, zoneId) {
				let i, part;
				if (parts.length === 16) {
					this.parts = [];
					for (i = 0; i <= 14; i += 2) this.parts.push(parts[i] << 8 | parts[i + 1]);
				} else if (parts.length === 8) this.parts = parts;
				else throw new Error("ipaddr: ipv6 part count should be 8 or 16");
				for (i = 0; i < this.parts.length; i++) {
					part = this.parts[i];
					if (!(0 <= part && part <= 65535)) throw new Error("ipaddr: ipv6 part should fit in 16 bits");
				}
				if (zoneId) this.zoneId = zoneId;
			}
			IPv6.prototype.SpecialRanges = {
				unspecified: [new IPv6([
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 128],
				linkLocal: [new IPv6([
					65152,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 10],
				multicast: [new IPv6([
					65280,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 8],
				loopback: [new IPv6([
					0,
					0,
					0,
					0,
					0,
					0,
					0,
					1
				]), 128],
				uniqueLocal: [new IPv6([
					64512,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 7],
				ipv4Mapped: [new IPv6([
					0,
					0,
					0,
					0,
					0,
					65535,
					0,
					0
				]), 96],
				deprecatedSiteLocal: [new IPv6([
					65216,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 10],
				discard: [new IPv6([
					256,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 64],
				rfc6145: [new IPv6([
					0,
					0,
					0,
					0,
					65535,
					0,
					0,
					0
				]), 96],
				rfc6052: [[new IPv6([
					100,
					65435,
					0,
					0,
					0,
					0,
					0,
					0
				]), 96], [new IPv6([
					100,
					65435,
					1,
					0,
					0,
					0,
					0,
					0
				]), 48]],
				"6to4": [new IPv6([
					8194,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 16],
				teredo: [new IPv6([
					8193,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 32],
				benchmarking: [new IPv6([
					8193,
					2,
					0,
					0,
					0,
					0,
					0,
					0
				]), 48],
				amt: [new IPv6([
					8193,
					3,
					0,
					0,
					0,
					0,
					0,
					0
				]), 32],
				as112v6: [[new IPv6([
					8193,
					4,
					274,
					0,
					0,
					0,
					0,
					0
				]), 48], [new IPv6([
					9760,
					79,
					32768,
					0,
					0,
					0,
					0,
					0
				]), 48]],
				deprecatedOrchid: [new IPv6([
					8193,
					16,
					0,
					0,
					0,
					0,
					0,
					0
				]), 28],
				orchid2: [new IPv6([
					8193,
					32,
					0,
					0,
					0,
					0,
					0,
					0
				]), 28],
				droneRemoteIdProtocolEntityTags: [new IPv6([
					8193,
					48,
					0,
					0,
					0,
					0,
					0,
					0
				]), 28],
				segmentRouting: [new IPv6([
					24320,
					0,
					0,
					0,
					0,
					0,
					0,
					0
				]), 16],
				reserved: [
					[new IPv6([
						8193,
						0,
						0,
						0,
						0,
						0,
						0,
						0
					]), 23],
					[new IPv6([
						8193,
						3512,
						0,
						0,
						0,
						0,
						0,
						0
					]), 32],
					[new IPv6([
						16383,
						0,
						0,
						0,
						0,
						0,
						0,
						0
					]), 20]
				]
			};
			IPv6.prototype.isIPv4MappedAddress = function() {
				return this.range() === "ipv4Mapped";
			};
			IPv6.prototype.kind = function() {
				return "ipv6";
			};
			IPv6.prototype.match = function(other, cidrRange) {
				let ref;
				if (cidrRange === void 0) {
					ref = other;
					other = ref[0];
					cidrRange = ref[1];
				}
				if (other.kind() !== "ipv6") throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
				return matchCIDR(this.parts, other.parts, 16, cidrRange);
			};
			IPv6.prototype.prefixLengthFromSubnetMask = function() {
				let cidr = 0;
				let stop = false;
				const zerotable = {
					0: 16,
					32768: 15,
					49152: 14,
					57344: 13,
					61440: 12,
					63488: 11,
					64512: 10,
					65024: 9,
					65280: 8,
					65408: 7,
					65472: 6,
					65504: 5,
					65520: 4,
					65528: 3,
					65532: 2,
					65534: 1,
					65535: 0
				};
				let part, zeros;
				for (let i = 7; i >= 0; i -= 1) {
					part = this.parts[i];
					if (part in zerotable) {
						zeros = zerotable[part];
						if (stop && zeros !== 0) return null;
						if (zeros !== 16) stop = true;
						cidr += zeros;
					} else return null;
				}
				return 128 - cidr;
			};
			IPv6.prototype.range = function() {
				return ipaddr.subnetMatch(this, this.SpecialRanges);
			};
			IPv6.prototype.toByteArray = function() {
				let part;
				const bytes = [];
				const ref = this.parts;
				for (let i = 0; i < ref.length; i++) {
					part = ref[i];
					bytes.push(part >> 8);
					bytes.push(part & 255);
				}
				return bytes;
			};
			IPv6.prototype.toFixedLengthString = function() {
				const addr = (function() {
					const results = [];
					for (let i = 0; i < this.parts.length; i++) results.push(padPart(this.parts[i].toString(16), 4));
					return results;
				}).call(this).join(":");
				let suffix = "";
				if (this.zoneId) suffix = `%${this.zoneId}`;
				return addr + suffix;
			};
			IPv6.prototype.toIPv4Address = function() {
				if (!this.isIPv4MappedAddress()) throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
				const ref = this.parts.slice(-2);
				const high = ref[0];
				const low = ref[1];
				return new ipaddr.IPv4([
					high >> 8,
					high & 255,
					low >> 8,
					low & 255
				]);
			};
			IPv6.prototype.toNormalizedString = function() {
				const addr = (function() {
					const results = [];
					for (let i = 0; i < this.parts.length; i++) results.push(this.parts[i].toString(16));
					return results;
				}).call(this).join(":");
				let suffix = "";
				if (this.zoneId) suffix = `%${this.zoneId}`;
				return addr + suffix;
			};
			IPv6.prototype.toRFC5952String = function() {
				const regex = /((^|:)(0(:|$)){2,})/g;
				const string = this.toNormalizedString();
				let bestMatchIndex = 0;
				let bestMatchLength = -1;
				let match;
				while (match = regex.exec(string)) if (match[0].length > bestMatchLength) {
					bestMatchIndex = match.index;
					bestMatchLength = match[0].length;
				}
				if (bestMatchLength < 0) return string;
				return `${string.substring(0, bestMatchIndex)}::${string.substring(bestMatchIndex + bestMatchLength)}`;
			};
			IPv6.prototype.toString = function() {
				return this.toRFC5952String();
			};
			return IPv6;
		})();
		ipaddr.IPv6.broadcastAddressFromCIDR = function(string) {
			try {
				const cidr = this.parseCIDR(string);
				const ipInterfaceOctets = cidr[0].toByteArray();
				const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
				const octets = [];
				let i = 0;
				while (i < 16) {
					octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
					i++;
				}
				return new this(octets);
			} catch (e) {
				throw new Error(`ipaddr: the address does not have IPv6 CIDR format (${e})`);
			}
		};
		ipaddr.IPv6.isIPv6 = function(string) {
			return this.parser(string) !== null;
		};
		ipaddr.IPv6.isValid = function(string) {
			if (typeof string === "string" && string.indexOf(":") === -1) return false;
			try {
				const addr = this.parser(string);
				new this(addr.parts, addr.zoneId);
				return true;
			} catch (e) {
				return false;
			}
		};
		ipaddr.IPv6.isValidCIDR = function(string) {
			if (typeof string === "string" && string.indexOf(":") === -1) return false;
			try {
				this.parseCIDR(string);
				return true;
			} catch (e) {
				return false;
			}
		};
		ipaddr.IPv6.networkAddressFromCIDR = function(string) {
			let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
			try {
				cidr = this.parseCIDR(string);
				ipInterfaceOctets = cidr[0].toByteArray();
				subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
				octets = [];
				i = 0;
				while (i < 16) {
					octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
					i++;
				}
				return new this(octets);
			} catch (e) {
				throw new Error(`ipaddr: the address does not have IPv6 CIDR format (${e})`);
			}
		};
		ipaddr.IPv6.parse = function(string) {
			const addr = this.parser(string);
			if (addr.parts === null) throw new Error("ipaddr: string is not formatted like an IPv6 Address");
			return new this(addr.parts, addr.zoneId);
		};
		ipaddr.IPv6.parseCIDR = function(string) {
			let maskLength, match, parsed;
			if (match = string.match(/^(.+)\/(\d+)$/)) {
				maskLength = parseInt(match[2]);
				if (maskLength >= 0 && maskLength <= 128) {
					parsed = [this.parse(match[1]), maskLength];
					Object.defineProperty(parsed, "toString", { value: function() {
						return this.join("/");
					} });
					return parsed;
				}
			}
			throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range");
		};
		ipaddr.IPv6.parser = function(string) {
			let addr, i, match, octet, octets, zoneId;
			if (match = string.match(ipv6Regexes.deprecatedTransitional)) return this.parser(`::ffff:${match[1]}`);
			if (ipv6Regexes.native.test(string)) return expandIPv6(string, 8);
			if (match = string.match(ipv6Regexes.transitional)) {
				zoneId = match[6] || "";
				addr = match[1];
				if (!match[1].endsWith("::")) addr = addr.slice(0, -1);
				addr = expandIPv6(addr + zoneId, 6);
				if (addr.parts) {
					octets = [
						parseInt(match[2]),
						parseInt(match[3]),
						parseInt(match[4]),
						parseInt(match[5])
					];
					for (i = 0; i < octets.length; i++) {
						octet = octets[i];
						if (!(0 <= octet && octet <= 255)) return null;
					}
					addr.parts.push(octets[0] << 8 | octets[1]);
					addr.parts.push(octets[2] << 8 | octets[3]);
					return {
						parts: addr.parts,
						zoneId: addr.zoneId
					};
				}
			}
			return null;
		};
		ipaddr.IPv6.subnetMaskFromPrefixLength = function(prefix) {
			prefix = parseInt(prefix);
			if (prefix < 0 || prefix > 128) throw new Error("ipaddr: invalid IPv6 prefix length");
			const octets = [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			];
			let j = 0;
			const filledOctetCount = Math.floor(prefix / 8);
			while (j < filledOctetCount) {
				octets[j] = 255;
				j++;
			}
			if (filledOctetCount < 16) octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8;
			return new this(octets);
		};
		ipaddr.fromByteArray = function(bytes) {
			const length = bytes.length;
			if (length === 4) return new ipaddr.IPv4(bytes);
			else if (length === 16) return new ipaddr.IPv6(bytes);
			else throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address");
		};
		ipaddr.isValid = function(string) {
			return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
		};
		ipaddr.isValidCIDR = function(string) {
			return ipaddr.IPv6.isValidCIDR(string) || ipaddr.IPv4.isValidCIDR(string);
		};
		ipaddr.parse = function(string) {
			if (ipaddr.IPv6.isValid(string)) return ipaddr.IPv6.parse(string);
			else if (ipaddr.IPv4.isValid(string)) return ipaddr.IPv4.parse(string);
			else throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
		};
		ipaddr.parseCIDR = function(string) {
			try {
				return ipaddr.IPv6.parseCIDR(string);
			} catch (e) {
				try {
					return ipaddr.IPv4.parseCIDR(string);
				} catch (e2) {
					throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format");
				}
			}
		};
		ipaddr.process = function(string) {
			const addr = this.parse(string);
			if (addr.kind() === "ipv6" && addr.isIPv4MappedAddress()) return addr.toIPv4Address();
			else return addr;
		};
		ipaddr.subnetMatch = function(address, rangeList, defaultName) {
			let i, rangeName, rangeSubnets, subnet;
			if (defaultName === void 0 || defaultName === null) defaultName = "unicast";
			for (rangeName in rangeList) if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
				rangeSubnets = rangeList[rangeName];
				if (rangeSubnets[0] && !(rangeSubnets[0] instanceof Array)) rangeSubnets = [rangeSubnets];
				for (i = 0; i < rangeSubnets.length; i++) {
					subnet = rangeSubnets[i];
					if (address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) return rangeName;
				}
			}
			return defaultName;
		};
		if (typeof module !== "undefined" && module.exports) module.exports = ipaddr;
		else root.ipaddr = ipaddr;
	})(exports);
}));
//#endregion
//#region node_modules/vinext/dist/shims/image-config.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_ipaddr = /* @__PURE__ */ __toESM(require_ipaddr(), 1);
/**
* Convert a glob pattern (with `*` and `**`) to a RegExp.
*
* For hostnames, segments are separated by `.`:
*   - `*` matches a single segment (no dots): [^.]+
*   - `**` matches any number of segments: .+
*
* For pathnames, segments are separated by `/`:
*   - `*` matches a single segment (no slashes): [^/]+
*   - `**` matches any number of segments (including empty): .*
*
* Literal characters are escaped for regex safety.
*/
function globToRegex(pattern, separator) {
	let regexStr = "^";
	const doubleStar = separator === "." ? ".+" : ".*";
	const singleStar = separator === "." ? "[^.]+" : "[^/]+";
	const parts = pattern.split("**");
	for (let i = 0; i < parts.length; i++) {
		if (i > 0) regexStr += doubleStar;
		const subParts = parts[i].split("*");
		for (let j = 0; j < subParts.length; j++) {
			if (j > 0) regexStr += singleStar;
			regexStr += subParts[j].replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		}
	}
	regexStr += "$";
	return new RegExp(regexStr);
}
/**
* Check whether a URL matches a single remote pattern.
* Follows the same semantics as Next.js's matchRemotePattern().
*/
function matchRemotePattern(pattern, url) {
	if (pattern.protocol !== void 0) {
		if (pattern.protocol.replace(/:$/, "") !== url.protocol.replace(/:$/, "")) return false;
	}
	if (pattern.port !== void 0) {
		if (pattern.port !== url.port) return false;
	}
	if (!globToRegex(pattern.hostname, ".").test(url.hostname)) return false;
	if (pattern.search !== void 0) {
		if (pattern.search !== url.search) return false;
	}
	if (!globToRegex(pattern.pathname ?? "**", "/").test(url.pathname)) return false;
	return true;
}
/**
* Check whether a URL matches any configured remote pattern or legacy domain.
*/
function hasRemoteMatch(domains, remotePatterns, url) {
	return domains.some((domain) => url.hostname === domain) || remotePatterns.some((p) => matchRemotePattern(p, url));
}
/**
* Determine whether a string is a private (non-routable) IP address.
* Works for IPv4 and IPv6, including bracketed and IPv4-mapped forms.
*
* Uses ipaddr.js with range() !== 'unicast' — the same approach Next.js
* takes (via packages/next/src/server/is-private-ip.ts). This covers all
* IETF non-unicast ranges (CGNAT, benchmarking, multicast, reserved,
* teredo, documentation, discard, NAT64, etc.) without hand-rolling CIDR
* prefix checks that are easy to get wrong.
*
* https://github.com/vercel/next.js/blob/canary/packages/next/src/server/is-private-ip.ts
*/
function isPrivateIp(ip) {
	if (ip.startsWith("[") && ip.endsWith("]")) ip = ip.slice(1, -1);
	try {
		const parsed = import_ipaddr.default.parse(ip);
		if (parsed instanceof import_ipaddr.default.IPv6 && parsed.isIPv4MappedAddress()) return parsed.toIPv4Address().range() !== "unicast";
		return parsed.range() !== "unicast";
	} catch {
		return false;
	}
}
//#endregion
//#region node_modules/vinext/dist/shims/use-merged-ref.js
function useMergedRef(refA, refB) {
	const cleanupA = (0, import_react.useRef)(null);
	const cleanupB = (0, import_react.useRef)(null);
	return (0, import_react.useCallback)((current) => {
		if (current === null) {
			const cleanupFnA = cleanupA.current;
			if (cleanupFnA) {
				cleanupA.current = null;
				cleanupFnA();
			}
			const cleanupFnB = cleanupB.current;
			if (cleanupFnB) {
				cleanupB.current = null;
				cleanupFnB();
			}
		} else {
			if (refA) cleanupA.current = applyRef(refA, current);
			if (refB) cleanupB.current = applyRef(refB, current);
		}
	}, [refA, refB]);
}
function applyRef(refA, current) {
	if (typeof refA === "function") {
		const cleanup = refA(current);
		if (typeof cleanup === "function") return cleanup;
		else return () => refA(null);
	} else {
		refA.current = current;
		return () => {
			refA.current = null;
		};
	}
}
//#endregion
//#region node_modules/@unpic/react/dist/chunk-VTEFGNYT.mjs
var import_jsx_runtime = require_jsx_runtime();
var nestedKeys = /* @__PURE__ */ new Set(["style"]);
var fixedMap = {
	srcset: "srcSet",
	fetchpriority: "use" in import_react ? "fetchPriority" : "fetchpriority"
};
var camelize = (key) => {
	if (key.startsWith("data-") || key.startsWith("aria-")) return key;
	return fixedMap[key] || key.replace(/-./g, (suffix) => suffix[1].toUpperCase());
};
function camelizeProps(props) {
	return Object.fromEntries(Object.entries(props).map(([k, v]) => [camelize(k), nestedKeys.has(k) && v && typeof v !== "string" ? camelizeProps(v) : v]));
}
//#endregion
//#region node_modules/@unpic/core/dist/chunk-7DG3H6KO.mjs
var getSizes = (width, layout) => {
	if (!width || !layout) return;
	switch (layout) {
		case `constrained`: return `(min-width: ${width}px) ${width}px, 100vw`;
		case `fixed`: return `${width}px`;
		case `fullWidth`: return `100vw`;
		default: return;
	}
};
var pixelate = (value) => value || value === 0 ? `${value}px` : void 0;
var getStyle = ({ width, height, aspectRatio, layout, objectFit = "cover", background }) => {
	const styleEntries = [["object-fit", objectFit]];
	if (background?.startsWith("https:") || background?.startsWith("http:") || background?.startsWith("data:") || background?.startsWith("/")) {
		styleEntries.push(["background-image", `url(${background})`]);
		styleEntries.push(["background-size", "cover"]);
		styleEntries.push(["background-repeat", "no-repeat"]);
	} else styleEntries.push(["background", background]);
	if (layout === "fixed") {
		styleEntries.push(["width", pixelate(width)]);
		styleEntries.push(["height", pixelate(height)]);
	}
	if (layout === "constrained") {
		styleEntries.push(["max-width", pixelate(width)]);
		styleEntries.push(["max-height", pixelate(height)]);
		styleEntries.push(["aspect-ratio", aspectRatio ? `${aspectRatio}` : void 0]);
		styleEntries.push(["width", "100%"]);
	}
	if (layout === "fullWidth") {
		styleEntries.push(["width", "100%"]);
		styleEntries.push(["aspect-ratio", aspectRatio ? `${aspectRatio}` : void 0]);
		styleEntries.push(["height", pixelate(height)]);
	}
	return Object.fromEntries(styleEntries.filter(([, value]) => value));
};
var DEFAULT_RESOLUTIONS = [
	6016,
	5120,
	4480,
	3840,
	3200,
	2560,
	2048,
	1920,
	1668,
	1280,
	1080,
	960,
	828,
	750,
	640
];
var LOW_RES_WIDTH = 24;
var getBreakpoints = ({ width, layout, resolutions = DEFAULT_RESOLUTIONS }) => {
	if (layout === "fullWidth") return resolutions;
	if (!width) return [];
	const doubleWidth = width * 2;
	if (layout === "fixed") return [width, doubleWidth];
	if (layout === "constrained") return [
		width,
		doubleWidth,
		...resolutions.filter((w) => w < doubleWidth)
	];
	return [];
};
var getSrcSetEntries = ({ src, width, layout = "constrained", height, aspectRatio, breakpoints, format }) => {
	breakpoints ||= getBreakpoints({
		width,
		layout
	});
	return breakpoints.sort((a, b) => a - b).map((bp) => {
		let transformedHeight;
		if (height && aspectRatio) transformedHeight = Math.round(bp / aspectRatio);
		return {
			url: src,
			width: bp,
			height: transformedHeight,
			format
		};
	});
};
var getSrcSet = (options) => {
	let { src, transformer, operations } = options;
	if (!transformer) return "";
	return getSrcSetEntries(options).map(({ url: _, ...transform }) => {
		return `${transformer(src, {
			...operations,
			...transform
		}, options.options)?.toString()} ${transform.width}w`;
	}).join(",\n");
};
function transformSharedProps({ width, height, priority, layout = "constrained", aspectRatio, ...props }) {
	width = width && Number(width) || void 0;
	height = height && Number(height) || void 0;
	if (priority) {
		props.loading ||= "eager";
		props.fetchpriority ||= "high";
	} else {
		props.loading ||= "lazy";
		props.decoding ||= "async";
	}
	if (props.alt === "") props.role ||= "presentation";
	if (aspectRatio) {
		if (width) if (height) {} else height = Math.round(width / aspectRatio);
		else if (height) width = Math.round(height * aspectRatio);
		else if (layout !== "fullWidth") {}
	} else if (width && height) aspectRatio = width / height;
	else if (layout !== "fullWidth") {}
	return {
		width,
		height,
		aspectRatio,
		layout,
		...props
	};
}
function transformBaseImageProps(props) {
	let { src, transformer, background, layout, objectFit, breakpoints, width, height, aspectRatio, unstyled, operations, options, ...transformedProps } = transformSharedProps(props);
	if (transformer && background === "auto") {
		const lowResHeight = aspectRatio ? Math.round(LOW_RES_WIDTH / aspectRatio) : void 0;
		const lowResImage = transformer(src, {
			width: LOW_RES_WIDTH,
			height: lowResHeight
		}, options);
		if (lowResImage) background = lowResImage.toString();
	}
	const styleProps = {
		width,
		height,
		aspectRatio,
		layout,
		objectFit,
		background
	};
	transformedProps.sizes ||= getSizes(width, layout);
	if (!unstyled) transformedProps.style = {
		...getStyle(styleProps),
		...transformedProps.style
	};
	if (transformer) {
		transformedProps.srcset = getSrcSet({
			src,
			width,
			height,
			aspectRatio,
			layout,
			breakpoints,
			transformer,
			operations,
			options
		});
		const transformed = transformer(src, {
			...operations,
			width,
			height
		}, options);
		if (transformed) src = transformed;
		if (layout === "fullWidth" || layout === "constrained") {
			width = void 0;
			height = void 0;
		}
	}
	return {
		...transformedProps,
		src: src?.toString(),
		width,
		height
	};
}
function normalizeImageType(type) {
	if (!type) return {};
	if (type.startsWith("image/")) return {
		format: type.slice(6),
		mimeType: type
	};
	return {
		format: type,
		mimeType: `image/${type === "jpg" ? "jpeg" : type}`
	};
}
function transformBaseSourceProps({ media, type, ...props }) {
	let { src, transformer, layout, breakpoints, width, height, aspectRatio, sizes, loading, decoding, operations, options, ...rest } = transformSharedProps(props);
	if (!transformer) return {};
	const { format, mimeType } = normalizeImageType(type);
	sizes ||= getSizes(width, layout);
	const srcset = getSrcSet({
		src,
		width,
		height,
		aspectRatio,
		layout,
		breakpoints,
		transformer,
		format,
		operations,
		options
	});
	const transformed = transformer(src, {
		...operations,
		width,
		height
	}, options);
	if (transformed) src = transformed;
	const returnObject = {
		...rest,
		sizes,
		srcset
	};
	if (media) returnObject.media = media;
	if (mimeType) returnObject.type = mimeType;
	return returnObject;
}
//#endregion
//#region node_modules/unpic/esm/data/domains.js
var domains_default = {
	"images.ctfassets.net": "contentful",
	"cdn.builder.io": "builder.io",
	"images.prismic.io": "imgix",
	"www.datocms-assets.com": "imgix",
	"cdn.sanity.io": "imgix",
	"images.unsplash.com": "imgix",
	"cdn.shopify.com": "shopify",
	"s7d1.scene7.com": "scene7",
	"ip.keycdn.com": "keycdn",
	"assets.caisy.io": "bunny",
	"images.contentstack.io": "contentstack",
	"ucarecdn.com": "uploadcare",
	"imagedelivery.net": "cloudflare_images",
	"wsrv.nl": "wsrv"
};
//#endregion
//#region node_modules/unpic/esm/data/subdomains.js
var subdomains_default = {
	"imgix.net": "imgix",
	"wp.com": "wordpress",
	"files.wordpress.com": "wordpress",
	"b-cdn.net": "bunny",
	"storyblok.com": "storyblok",
	"kc-usercontent.com": "kontent.ai",
	"cloudinary.com": "cloudinary",
	"kxcdn.com": "keycdn",
	"imgeng.in": "imageengine",
	"imagekit.io": "imagekit",
	"cloudimg.io": "cloudimage",
	"ucarecdn.com": "uploadcare",
	"supabase.co": "supabase",
	"graphassets.com": "hygraph"
};
//#endregion
//#region node_modules/unpic/esm/data/paths.js
var paths_default = {
	"/cdn-cgi/image/": "cloudflare",
	"/cdn-cgi/imagedelivery/": "cloudflare_images",
	"/_next/image": "nextjs",
	"/_vercel/image": "vercel",
	"/is/image": "scene7",
	"/_ipx/": "ipx",
	"/_image": "astro",
	"/.netlify/images": "netlify",
	"/storage/v1/object/public/": "supabase",
	"/storage/v1/render/image/public/": "supabase",
	"/v1/storage/buckets/": "appwrite"
};
//#endregion
//#region node_modules/unpic/esm/src/utils.js
function roundIfNumeric(value) {
	if (!value) return value;
	const num = Number(value);
	if (isNaN(num)) return value;
	return Math.round(num);
}
/**
* Given a URL object, returns path and query params
*/
var toRelativeUrl = (url) => {
	const { pathname, search } = url;
	return `${pathname}${search}`;
};
/**
* Returns a URL string that may be relative or absolute
*/
var toCanonicalUrlString = (url) => {
	return url.hostname === "n" ? toRelativeUrl(url) : url.toString();
};
/**
* Normalises a URL object or string URL to a URL object.
*/
var toUrl = (url, base) => {
	return typeof url === "string" ? new URL(url, base ?? "http://n/") : url;
};
/**
* Escapes a string, even if it's URL-safe
*/
var escapeChar = (text) => text === " " ? "+" : "%" + text.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
var stripLeadingSlash = (str) => str?.startsWith("/") ? str.slice(1) : str;
var stripTrailingSlash = (str) => str?.endsWith("/") ? str.slice(0, -1) : str;
var addTrailingSlash = (str) => str?.endsWith("/") ? str : `${str}/`;
/**
* Creates a formatter given an operation joiner and key/value joiner
*/
var createFormatter = (kvSeparator, paramSeparator) => {
	const encodedValueJoiner = escapeChar(kvSeparator);
	const encodedOperationJoiner = escapeChar(paramSeparator);
	function escape(value) {
		return encodeURIComponent(value).replaceAll(kvSeparator, encodedValueJoiner).replaceAll(paramSeparator, encodedOperationJoiner);
	}
	function format(key, value) {
		return `${escape(key)}${kvSeparator}${escape(String(value))}`;
	}
	return (operations) => {
		return (Array.isArray(operations) ? operations : Object.entries(operations)).flatMap(([key, value]) => {
			if (value === void 0 || value === null) return [];
			if (Array.isArray(value)) return value.map((v) => format(key, v));
			return format(key, value);
		}).join(paramSeparator);
	};
};
/**
* Creates a parser given an operation joiner and key/value joiner
*/
var createParser = (kvSeparator, paramSeparator) => {
	if (kvSeparator === "=" && paramSeparator === "&") return queryParser;
	return (url) => {
		const urlString = url.toString();
		return Object.fromEntries(urlString.split(paramSeparator).map((pair) => {
			const [key, value] = pair.split(kvSeparator);
			return [decodeURI(key), decodeURI(value)];
		}));
	};
};
/**
* Clamp width and height, maintaining aspect ratio
*/
function clampDimensions(operations, maxWidth = 4e3, maxHeight = 4e3) {
	let { width, height } = operations;
	width = Number(width) || void 0;
	height = Number(height) || void 0;
	if (width && width > maxWidth) {
		if (height) height = Math.round(height * maxWidth / width);
		width = maxWidth;
	}
	if (height && height > maxHeight) {
		if (width) width = Math.round(width * maxHeight / height);
		height = maxHeight;
	}
	return {
		width,
		height
	};
}
function extractFromURL(url) {
	const parsedUrl = toUrl(url);
	const operations = Object.fromEntries(parsedUrl.searchParams.entries());
	for (const key in [
		"width",
		"height",
		"quality"
	]) {
		const value = operations[key];
		if (value) {
			const newVal = Number(value);
			if (!isNaN(newVal)) operations[key] = newVal;
		}
	}
	parsedUrl.search = "";
	return {
		operations,
		src: toCanonicalUrlString(parsedUrl)
	};
}
function normaliseOperations({ keyMap = {}, formatMap = {}, defaults = {} }, operations) {
	if (operations.format && operations.format in formatMap) operations.format = formatMap[operations.format];
	if (operations.width) operations.width = roundIfNumeric(operations.width);
	if (operations.height) operations.height = roundIfNumeric(operations.height);
	for (const k in keyMap) {
		if (!Object.prototype.hasOwnProperty.call(keyMap, k)) continue;
		const key = k;
		if (keyMap[key] === false) {
			delete operations[key];
			continue;
		}
		if (keyMap[key] && operations[key]) {
			operations[keyMap[key]] = operations[key];
			delete operations[key];
		}
	}
	for (const k in defaults) {
		if (!Object.prototype.hasOwnProperty.call(defaults, k)) continue;
		const key = k;
		const value = defaults[key];
		if (!operations[key] && value !== void 0) {
			if (keyMap[key] === false) continue;
			const resolvedKey = keyMap[key] ?? key;
			if (resolvedKey in operations) continue;
			operations[resolvedKey] = value;
		}
	}
	return operations;
}
var invertMap = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
function denormaliseOperations({ keyMap = {}, formatMap = {}, defaults = {} }, operations) {
	const ops = normaliseOperations({
		keyMap: invertMap(keyMap),
		formatMap: invertMap(formatMap),
		defaults
	}, operations);
	if (ops.width) ops.width = roundIfNumeric(ops.width);
	if (ops.height) ops.height = roundIfNumeric(ops.height);
	const q = Number(ops.quality);
	if (!isNaN(q)) ops.quality = q;
	return ops;
}
var queryParser = (url) => {
	const parsedUrl = toUrl(url);
	return Object.fromEntries(parsedUrl.searchParams.entries());
};
function createOperationsGenerator({ kvSeparator = "=", paramSeparator = "&", ...options } = {}) {
	const formatter = createFormatter(kvSeparator, paramSeparator);
	return (operations) => {
		return formatter(normaliseOperations(options, operations));
	};
}
function createOperationsParser({ kvSeparator = "=", paramSeparator = "&", defaults: _, ...options } = {}) {
	const parser = createParser(kvSeparator, paramSeparator);
	return (url) => {
		return denormaliseOperations(options, url ? parser(url) : {});
	};
}
function createOperationsHandlers(config) {
	return {
		operationsGenerator: createOperationsGenerator(config),
		operationsParser: createOperationsParser(config)
	};
}
function paramToBoolean(value) {
	if (value === void 0 || value === null) return;
	try {
		return Boolean(JSON.parse(value?.toString()));
	} catch {
		return Boolean(value);
	}
}
var removeUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== void 0));
function createExtractAndGenerate(extract, generate) {
	return ((src, operations, options) => {
		const base = extract(src, options);
		if (!base) return generate(src, operations, options);
		return generate(base.src, {
			...base.operations,
			...removeUndefined(operations)
		}, {
			...base.options,
			...options
		});
	});
}
//#endregion
//#region node_modules/unpic/esm/src/detect.js
var cdnDomains = new Map(Object.entries(domains_default));
var cdnSubdomains = Object.entries(subdomains_default);
var cdnPaths = Object.entries(paths_default);
/**
* Detects the image CDN provider for a given URL.
*/
function getProviderForUrl(url) {
	return getProviderForUrlByDomain(url) || getProviderForUrlByPath(url);
}
function getProviderForUrlByDomain(url) {
	if (typeof url === "string" && !url.startsWith("https://")) return false;
	const { hostname } = toUrl(url);
	const cdn = cdnDomains.get(hostname);
	if (cdn) return cdn;
	return cdnSubdomains.find(([subdomain]) => hostname.endsWith(subdomain))?.[1] || false;
}
/**
* Gets the image CDN provider for a given URL by its path.
*/
function getProviderForUrlByPath(url) {
	const { pathname } = toUrl(url);
	return cdnPaths.find(([path]) => pathname.startsWith(path))?.[1] || false;
}
//#endregion
//#region node_modules/unpic/esm/src/providers/appwrite.js
var VIEW_URL_SUFFIX = "/view?";
var PREVIEW_URL_SUFFIX = "/preview?";
var { operationsGenerator: operationsGenerator$25, operationsParser: operationsParser$20 } = createOperationsHandlers({
	keyMap: { format: "output" },
	kvSeparator: "=",
	paramSeparator: "&"
});
var generate$26 = (src, modifiers) => {
	const url = toUrl(src.toString().replace(VIEW_URL_SUFFIX, PREVIEW_URL_SUFFIX));
	const projectParam = url.searchParams.get("project") ?? "";
	url.search = operationsGenerator$25(modifiers);
	url.searchParams.append("project", projectParam);
	return toCanonicalUrlString(url);
};
var extract$26 = (url) => {
	if (getProviderForUrlByPath(url) !== "appwrite") return null;
	const parsedUrl = toUrl(url);
	const operations = operationsParser$20(parsedUrl);
	delete operations.project;
	const projectParam = parsedUrl.searchParams.get("project") ?? "";
	parsedUrl.search = "";
	parsedUrl.searchParams.append("project", projectParam);
	return {
		src: parsedUrl.href,
		operations
	};
};
var transform$27 = createExtractAndGenerate(extract$26, generate$26);
//#endregion
//#region node_modules/unpic/esm/src/providers/astro.js
var DEFAULT_ENDPOINT = "/_image";
var { operationsParser: operationsParser$19, operationsGenerator: operationsGenerator$24 } = createOperationsHandlers({
	keyMap: {
		format: "f",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: { fit: "cover" }
});
var generate$25 = (src, modifiers, options) => {
	const url = toUrl(`${stripTrailingSlash(options?.baseUrl ?? "")}${options?.endpoint ?? DEFAULT_ENDPOINT}`);
	url.search = operationsGenerator$24(modifiers);
	url.searchParams.set("href", src.toString());
	return toCanonicalUrlString(url);
};
var extract$25 = (url) => {
	const parsedUrl = toUrl(url);
	const src = parsedUrl.searchParams.get("href");
	if (!src) return null;
	parsedUrl.searchParams.delete("href");
	return {
		src,
		operations: operationsParser$19(parsedUrl),
		options: { baseUrl: parsedUrl.origin }
	};
};
var transform$26 = (src, operations, options = {}) => {
	if (toUrl(src).pathname !== (options?.endpoint ?? DEFAULT_ENDPOINT)) return generate$25(src, operations, options);
	const base = extract$25(src);
	if (!base) return generate$25(src, operations, options);
	options.baseUrl ??= base.options.baseUrl;
	return generate$25(base.src, {
		...base.operations,
		...operations
	}, options);
};
//#endregion
//#region node_modules/unpic/esm/src/providers/builder.io.js
var operationsGenerator$23 = createOperationsGenerator({ defaults: {
	fit: "cover",
	format: "webp",
	sharp: true
} });
var extract$24 = extractFromURL;
var generate$24 = (src, modifiers) => {
	const operations = operationsGenerator$23(modifiers);
	const url = toUrl(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};
var transform$25 = createExtractAndGenerate(extract$24, generate$24);
//#endregion
//#region node_modules/unpic/esm/src/providers/bunny.js
var operationsGenerator$22 = createOperationsGenerator({ keyMap: { format: "output" } });
var extract$23 = extractFromURL;
var generate$23 = (src, modifiers) => {
	const operations = operationsGenerator$22(modifiers);
	const url = toUrl(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};
var extractAndGenerate$1 = createExtractAndGenerate(extract$23, generate$23);
var transform$24 = (src, operations) => {
	const { width, height } = operations;
	if (width && height) operations.aspect_ratio ??= `${Math.round(Number(width))}:${Math.round(Number(height))}`;
	return extractAndGenerate$1(src, operations);
};
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudflare.js
var { operationsGenerator: operationsGenerator$21, operationsParser: operationsParser$18 } = createOperationsHandlers({
	keyMap: { "format": "f" },
	defaults: {
		format: "auto",
		fit: "cover"
	},
	formatMap: { jpg: "jpeg" },
	kvSeparator: "=",
	paramSeparator: ","
});
var generate$22 = (src, operations, options) => {
	const modifiers = operationsGenerator$21(operations);
	const url = toUrl(options?.domain ? `https://${options.domain}` : "/");
	url.pathname = `/cdn-cgi/image/${modifiers}/${stripLeadingSlash(src.toString())}`;
	return toCanonicalUrlString(url);
};
var extract$22 = (url, options) => {
	if (getProviderForUrlByPath(url) !== "cloudflare") return null;
	const parsedUrl = toUrl(url);
	const [, , , modifiers, ...src] = parsedUrl.pathname.split("/");
	const operations = operationsParser$18(modifiers);
	return {
		src: toCanonicalUrlString(toUrl(src.join("/"))),
		operations,
		options: { domain: options?.domain ?? (parsedUrl.hostname === "n" ? void 0 : parsedUrl.hostname) }
	};
};
var transform$23 = createExtractAndGenerate(extract$22, generate$22);
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudflare_images.js
var cloudflareImagesRegex = /https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
var imagedeliveryRegex = /https?:\/\/(?<host>imagedelivery.net)\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
var { operationsGenerator: operationsGenerator$20, operationsParser: operationsParser$17 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f"
	},
	defaults: { fit: "cover" },
	kvSeparator: "=",
	paramSeparator: ","
});
function formatUrl(options, transformations) {
	const { host, accountHash, imageId } = options;
	if (!host || !accountHash || !imageId) throw new Error("Missing required Cloudflare Images options");
	return [
		"https:/",
		...host === "imagedelivery.net" ? [host] : [
			host,
			"cdn-cgi",
			"imagedelivery"
		],
		accountHash,
		imageId,
		transformations
	].filter(Boolean).join("/");
}
var generate$21 = (_src, operations, options = {}) => {
	return toCanonicalUrlString(toUrl(formatUrl(options, operationsGenerator$20(operations))));
};
var extract$21 = (url) => {
	const parsedUrl = toUrl(url);
	const matches = [...parsedUrl.toString().matchAll(cloudflareImagesRegex), ...parsedUrl.toString().matchAll(imagedeliveryRegex)];
	if (!matches[0]?.groups) return null;
	const { host, accountHash, imageId, transformations } = matches[0].groups;
	const operations = operationsParser$17(transformations || "");
	const options = {
		host,
		accountHash,
		imageId
	};
	return {
		src: formatUrl(options),
		operations,
		options
	};
};
var transform$22 = (src, operations, options = {}) => {
	const extracted = extract$21(src);
	if (!extracted) throw new Error("Invalid Cloudflare Images URL");
	const newOperations = {
		...extracted.operations,
		...operations
	};
	return generate$21(extracted.src, newOperations, {
		...extracted.options,
		...options
	});
};
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudimage.js
var { operationsGenerator: operationsGenerator$19, operationsParser: operationsParser$16 } = createOperationsHandlers({
	keyMap: {
		format: "force_format",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: { org_if_sml: 1 }
});
var generate$20 = (src, modifiers = {}, { token } = {}) => {
	if (!token) throw new Error("Token is required for Cloudimage URLs" + src);
	let srcString = src.toString();
	srcString = srcString.replace(/^https?:\/\//, "");
	if (srcString.includes("?")) {
		modifiers.ci_url_encoded = 1;
		srcString = encodeURIComponent(srcString);
	}
	const operations = operationsGenerator$19(modifiers);
	const url = new URL(`https://${token}.cloudimg.io/`);
	url.pathname = srcString;
	url.search = operations;
	return url.toString();
};
var extract$20 = (src, options = {}) => {
	const url = toUrl(src);
	if (getProviderForUrl(url) !== "cloudimage") return null;
	const operations = operationsParser$16(url);
	let originalSrc = url.pathname;
	if (operations.ci_url_encoded) {
		originalSrc = decodeURIComponent(originalSrc);
		delete operations.ci_url_encoded;
	}
	options.token ??= url.hostname.replace(".cloudimg.io", "");
	return {
		src: `${url.protocol}/${originalSrc}`,
		operations,
		options
	};
};
var transform$21 = createExtractAndGenerate(extract$20, generate$20);
//#endregion
//#region node_modules/unpic/esm/src/providers/cloudinary.js
var publicRegex = /https?:\/\/(?<host>res\.cloudinary\.com)\/(?<cloudName>[a-zA-Z0-9-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
var privateRegex = /https?:\/\/(?<host>(?<cloudName>[a-zA-Z0-9-]+)-res\.cloudinary\.com|[a-zA-Z0-9.-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
var { operationsGenerator: operationsGenerator$18, operationsParser: operationsParser$15 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q"
	},
	defaults: {
		format: "auto",
		c: "lfill"
	},
	kvSeparator: "_",
	paramSeparator: ","
});
function formatCloudinaryUrl({ host, cloudName, assetType, deliveryType, signature, transformations, version, id }) {
	return [
		"https:/",
		host,
		host === "res.cloudinary.com" ? cloudName : void 0,
		assetType,
		deliveryType,
		signature,
		transformations,
		version,
		id
	].filter(Boolean).join("/");
}
function parseCloudinaryUrl(url) {
	let matches = url.toString().match(publicRegex);
	if (!matches?.length) matches = url.toString().match(privateRegex);
	if (!matches?.length) return null;
	return matches.groups || {};
}
var transform$20 = (src, operations) => {
	const group = parseCloudinaryUrl(src.toString());
	if (!group) return src.toString();
	group.transformations = operationsGenerator$18({
		...operationsParser$15(group.transformations || ""),
		...operations
	});
	return formatCloudinaryUrl(group);
};
//#endregion
//#region node_modules/unpic/esm/src/providers/contentful.js
var operationsGenerator$17 = createOperationsGenerator({
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: { fit: "fill" }
});
var generate$19 = (src, modifiers) => {
	const operations = operationsGenerator$17(modifiers);
	const url = new URL(src);
	url.search = operations;
	return toCanonicalUrlString(url);
};
var extractAndGenerate = createExtractAndGenerate(extractFromURL, generate$19);
var transform$19 = (src, operations) => {
	const { width, height } = clampDimensions(operations, 4e3, 4e3);
	return extractAndGenerate(src, {
		...operations,
		width,
		height
	});
};
//#endregion
//#region node_modules/unpic/esm/src/providers/contentstack.js
var operationsGenerator$16 = createOperationsGenerator({ defaults: {
	auto: "webp",
	disable: "upscale"
} });
var generate$18 = (src, operations, { baseURL = "https://images.contentstack.io/" } = {}) => {
	if (operations.width && operations.height) operations.fit ??= "crop";
	const modifiers = operationsGenerator$16(operations);
	const url = toUrl(src);
	if (url.hostname === "n") {
		url.protocol = "https:";
		url.hostname = new URL(baseURL).hostname;
	}
	url.search = modifiers;
	return toCanonicalUrlString(url);
};
var extract$18 = (url) => {
	const { src, operations } = extractFromURL(url) ?? {};
	if (!operations || !src) return null;
	const { origin } = toUrl(url);
	return {
		src,
		operations,
		options: { baseURL: origin }
	};
};
var transform$18 = createExtractAndGenerate(extract$18, generate$18);
//#endregion
//#region node_modules/unpic/esm/src/providers/directus.js
var operationsGenerator$15 = createOperationsGenerator({ defaults: {
	withoutEnlargement: true,
	fit: "cover"
} });
var generate$17 = (src, operations) => {
	if (Array.isArray(operations.transforms)) operations.transforms = JSON.stringify(operations.transforms);
	const modifiers = operationsGenerator$15(operations);
	const url = toUrl(src);
	url.search = modifiers;
	return toCanonicalUrlString(url);
};
var extract$17 = (url) => {
	const base = extractFromURL(url);
	if (base?.operations?.transforms && typeof base.operations.transforms === "string") try {
		base.operations.transforms = JSON.parse(base.operations.transforms);
	} catch {
		return null;
	}
	return base;
};
var transform$17 = createExtractAndGenerate(extract$17, generate$17);
//#endregion
//#region node_modules/unpic/esm/src/providers/hygraph.js
var hygraphRegex = /https:\/\/(?<region>[a-z0-9-]+)\.graphassets\.com\/(?<envId>[a-zA-Z0-9]+)(?:\/(?<transformations>.*?))?\/(?<handle>[a-zA-Z0-9]+)$/;
var { operationsGenerator: operationsGenerator$14, operationsParser: operationsParser$14 } = createOperationsHandlers({
	keyMap: {
		width: "width",
		height: "height",
		format: "format"
	},
	defaults: {
		format: "auto",
		fit: "crop"
	}
});
var extract$16 = (url) => {
	const matches = toUrl(url).toString().match(hygraphRegex);
	if (!matches?.groups) return null;
	const { region, envId, handle, transformations } = matches.groups;
	const operations = {};
	if (transformations) transformations.split("/").forEach((part) => {
		const [operation, params] = part.split("=");
		if (operation === "resize" && params) params.split(",").forEach((param) => {
			const [key, value] = param.split(":");
			if (key === "width" || key === "height") operations[key] = Number(value);
			else if (key === "fit") operations.fit = value;
		});
		else if (operation === "output" && params) params.split(",").forEach((param) => {
			const [key, value] = param.split(":");
			if (key === "format") operations.format = value;
		});
		else if (operation === "auto_image") operations.format = "auto";
	});
	return {
		src: `https://${region}.graphassets.com/${envId}/${handle}`,
		operations,
		options: {
			region,
			envId,
			handle
		}
	};
};
var generate$16 = (src, operations, options = {}) => {
	const extracted = extract$16(src);
	if (!extracted) throw new Error("Invalid Hygraph URL");
	const { region, envId, handle } = {
		...extracted.options,
		...options
	};
	const transforms = [];
	if (operations.width || operations.height) {
		const resize = [];
		if (operations.width && operations.height) resize.push("fit:crop");
		else if (operations.fit) resize.push(`fit:${operations.fit}`);
		if (operations.width) resize.push(`width:${operations.width}`);
		if (operations.height) resize.push(`height:${operations.height}`);
		if (resize.length) transforms.push(`resize=${resize.join(",")}`);
	}
	if (operations.format === "auto" || !operations.format && !extracted.operations.format) transforms.push("auto_image");
	else if (operations.format) transforms.push(`output=format:${operations.format}`);
	return toCanonicalUrlString(toUrl(`${`https://${region}.graphassets.com/${envId}`}${transforms.length > 0 ? "/" + transforms.join("/") : ""}/${handle}`));
};
var transform$16 = createExtractAndGenerate(extract$16, generate$16);
//#endregion
//#region node_modules/unpic/esm/src/providers/imageengine.js
var { operationsGenerator: operationsGenerator$13, operationsParser: operationsParser$13 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f"
	},
	defaults: { m: "cropbox" },
	kvSeparator: "_",
	paramSeparator: "/"
});
var generate$15 = (src, operations) => {
	const modifiers = operationsGenerator$13(operations);
	const url = toUrl(src);
	url.searchParams.set("imgeng", modifiers);
	return toCanonicalUrlString(url);
};
var extract$15 = (url) => {
	const parsedUrl = toUrl(url);
	const imgeng = parsedUrl.searchParams.get("imgeng");
	if (!imgeng) return null;
	const operations = operationsParser$13(imgeng);
	parsedUrl.searchParams.delete("imgeng");
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$15 = createExtractAndGenerate(extract$15, generate$15);
//#endregion
//#region node_modules/unpic/esm/src/providers/imagekit.js
var { operationsGenerator: operationsGenerator$12, operationsParser: operationsParser$12 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q"
	},
	defaults: {
		c: "maintain_ratio",
		fo: "auto"
	},
	kvSeparator: "-",
	paramSeparator: ","
});
var generate$14 = (src, operations) => {
	const modifiers = operationsGenerator$12(operations);
	const url = toUrl(src);
	url.searchParams.set("tr", modifiers);
	return toCanonicalUrlString(url);
};
var extract$14 = (url) => {
	const parsedUrl = toUrl(url);
	let trPart = null;
	let path = parsedUrl.pathname;
	if (parsedUrl.searchParams.has("tr")) {
		trPart = parsedUrl.searchParams.get("tr");
		parsedUrl.searchParams.delete("tr");
	} else {
		const pathParts = parsedUrl.pathname.split("/");
		const trIndex = pathParts.findIndex((part) => part.startsWith("tr:"));
		if (trIndex !== -1) {
			trPart = pathParts[trIndex].slice(3);
			path = pathParts.slice(0, trIndex).concat(pathParts.slice(trIndex + 1)).join("/");
		}
	}
	if (!trPart) return null;
	parsedUrl.pathname = path;
	const operations = operationsParser$12(trPart);
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$14 = createExtractAndGenerate(extract$14, generate$14);
//#endregion
//#region node_modules/unpic/esm/src/providers/imgix.js
var { operationsGenerator: operationsGenerator$11, operationsParser: operationsParser$11 } = createOperationsHandlers({
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	},
	defaults: {
		fit: "min",
		auto: "format"
	}
});
var extract$13 = (url) => {
	const src = toUrl(url);
	const operations = operationsParser$11(url);
	src.search = "";
	return {
		src: toCanonicalUrlString(src),
		operations
	};
};
var generate$13 = (src, operations) => {
	const modifiers = operationsGenerator$11(operations);
	const url = toUrl(src);
	url.search = modifiers;
	if (url.searchParams.has("fm") && url.searchParams.get("auto") === "format") url.searchParams.delete("auto");
	return toCanonicalUrlString(url);
};
var transform$13 = createExtractAndGenerate(extract$13, generate$13);
//#endregion
//#region node_modules/unpic/esm/src/providers/ipx.js
var { operationsGenerator: operationsGenerator$10, operationsParser: operationsParser$10 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		quality: "q",
		format: "f"
	},
	defaults: { f: "auto" },
	kvSeparator: "_",
	paramSeparator: ","
});
var generate$12 = (src, operations, options) => {
	if (operations.width && operations.height) {
		operations.s = `${operations.width}x${operations.height}`;
		delete operations.width;
		delete operations.height;
	}
	const modifiers = operationsGenerator$10(operations);
	const url = toUrl(options?.baseURL ?? "/_ipx");
	url.pathname = `${stripTrailingSlash(url.pathname)}/${modifiers}/${stripLeadingSlash(src.toString())}`;
	return toCanonicalUrlString(url);
};
var extract$12 = (url) => {
	const parsedUrl = toUrl(url);
	const [, baseUrlPart, modifiers, ...srcParts] = parsedUrl.pathname.split("/");
	if (!modifiers || !srcParts.length) return null;
	const operations = operationsParser$10(modifiers);
	if (operations.s) {
		const [width, height] = operations.s.split("x").map(Number);
		operations.width = width;
		operations.height = height;
		delete operations.s;
	}
	return {
		src: "/" + srcParts.join("/"),
		operations,
		options: { baseURL: `${parsedUrl.origin}/${baseUrlPart}` }
	};
};
var transform$12 = (src, operations, options) => {
	const url = toUrl(src);
	const baseURL = options?.baseURL;
	if (baseURL && url.toString().startsWith(baseURL) || url.pathname.startsWith("/_ipx")) {
		const extracted = extract$12(src);
		if (extracted) return generate$12(extracted.src, {
			...extracted.operations,
			...operations
		}, { baseURL: extracted.options.baseURL });
	}
	return generate$12(src, operations, { baseURL });
};
//#endregion
//#region node_modules/unpic/esm/src/providers/keycdn.js
var BOOLEAN_PARAMS = [
	"enlarge",
	"flip",
	"flop",
	"negate",
	"normalize",
	"grayscale",
	"removealpha",
	"olrepeat",
	"progressive",
	"adaptive",
	"lossless",
	"nearlossless",
	"metadata"
];
var { operationsGenerator: operationsGenerator$9, operationsParser: operationsParser$9 } = createOperationsHandlers({
	defaults: { fit: "cover" },
	formatMap: { jpg: "jpeg" }
});
var generate$11 = (src, operations) => {
	const url = toUrl(src);
	for (const key of BOOLEAN_PARAMS) if (operations[key] !== void 0) operations[key] = operations[key] ? 1 : 0;
	url.search = operationsGenerator$9(operations);
	return toCanonicalUrlString(url);
};
var extract$11 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$9(parsedUrl);
	for (const key of BOOLEAN_PARAMS) if (operations[key] !== void 0) operations[key] = paramToBoolean(operations[key]);
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$11 = createExtractAndGenerate(extract$11, generate$11);
//#endregion
//#region node_modules/unpic/esm/src/providers/kontent.ai.js
var { operationsGenerator: operationsGenerator$8, operationsParser: operationsParser$8 } = createOperationsHandlers({
	formatMap: { jpg: "jpeg" },
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	}
});
var generate$10 = (src, operations) => {
	const url = toUrl(src);
	if (operations.lossless !== void 0) operations.lossless = operations.lossless ? 1 : 0;
	if (operations.width && operations.height) operations.fit = "crop";
	url.search = operationsGenerator$8(operations);
	return toCanonicalUrlString(url);
};
var extract$10 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$8(parsedUrl);
	if (operations.lossless !== void 0) operations.lossless = paramToBoolean(operations.lossless);
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$10 = createExtractAndGenerate(extract$10, generate$10);
//#endregion
//#region node_modules/unpic/esm/src/providers/netlify.js
var { operationsGenerator: operationsGenerator$7, operationsParser: operationsParser$7 } = createOperationsHandlers({
	defaults: { fit: "cover" },
	keyMap: {
		format: "fm",
		width: "w",
		height: "h",
		quality: "q"
	}
});
var generate$9 = (src, operations, options = {}) => {
	const url = toUrl(`${options.baseUrl || ""}/.netlify/images`);
	url.search = operationsGenerator$7(operations);
	url.searchParams.set("url", src.toString());
	return toCanonicalUrlString(url);
};
var extract$9 = (url) => {
	if (getProviderForUrlByPath(url) !== "netlify") return null;
	const parsedUrl = toUrl(url);
	const operations = operationsParser$7(parsedUrl);
	delete operations.url;
	const sourceUrl = parsedUrl.searchParams.get("url") || "";
	parsedUrl.search = "";
	return {
		src: sourceUrl,
		operations,
		options: { baseUrl: parsedUrl.hostname === "n" ? void 0 : parsedUrl.origin }
	};
};
var transform$9 = createExtractAndGenerate(extract$9, generate$9);
//#endregion
//#region node_modules/unpic/esm/src/providers/vercel.js
var { operationsGenerator: operationsGenerator$6, operationsParser: operationsParser$6 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		quality: "q",
		height: false,
		format: false
	},
	defaults: { q: 75 }
});
var generate$8 = (src, operations, options = {}) => {
	const url = toUrl(`${options.baseUrl || ""}/${options.prefix || "_vercel"}/image`);
	url.search = operationsGenerator$6(operations);
	url.searchParams.append("url", src.toString());
	return toCanonicalUrlString(url);
};
var extract$8 = (url, options = {}) => {
	if (!["vercel", "nextjs"].includes(getProviderForUrlByPath(url) || "")) return null;
	const parsedUrl = toUrl(url);
	const sourceUrl = parsedUrl.searchParams.get("url") || "";
	parsedUrl.searchParams.delete("url");
	const operations = operationsParser$6(parsedUrl);
	parsedUrl.search = "";
	return {
		src: sourceUrl,
		operations,
		options: { baseUrl: options.baseUrl ?? parsedUrl.origin }
	};
};
var transform$8 = createExtractAndGenerate(extract$8, generate$8);
//#endregion
//#region node_modules/unpic/esm/src/providers/nextjs.js
var generate$7 = (src, operations, options = {}) => generate$8(src, operations, {
	...options,
	prefix: "_next"
});
var extract$7 = (url, options) => extract$8(url, options);
var transform$7 = createExtractAndGenerate(extract$7, generate$7);
//#endregion
//#region node_modules/unpic/esm/src/providers/scene7.js
var { operationsGenerator: operationsGenerator$5, operationsParser: operationsParser$5 } = createOperationsHandlers({
	keyMap: {
		width: "wid",
		height: "hei",
		quality: "qlt",
		format: "fmt"
	},
	defaults: { fit: "crop,0" }
});
var BASE = "https://s7d1.scene7.com/is/image/";
var generate$6 = (src, operations) => {
	const url = new URL(src, BASE);
	url.search = operationsGenerator$5(operations);
	return toCanonicalUrlString(url);
};
var extract$6 = (url) => {
	if (getProviderForUrl(url) !== "scene7") return null;
	const parsedUrl = new URL(url, BASE);
	const operations = operationsParser$5(parsedUrl);
	parsedUrl.search = "";
	return {
		src: parsedUrl.toString(),
		operations
	};
};
var transform$6 = createExtractAndGenerate(extract$6, generate$6);
//#endregion
//#region node_modules/unpic/esm/src/providers/shopify.js
var shopifyRegex = /(.+?)(?:_(?:(pico|icon|thumb|small|compact|medium|large|grande|original|master)|(\d*)x(\d*)))?(?:_crop_([a-z]+))?(\.[a-zA-Z]+)(\.png|\.jpg|\.webp|\.avif)?$/;
var { operationsGenerator: operationsGenerator$4, operationsParser: operationsParser$4 } = createOperationsHandlers({ keyMap: { format: false } });
var generate$5 = (src, operations) => {
	const url = toUrl(src);
	url.pathname = url.pathname.replace(shopifyRegex, "$1$6");
	url.search = operationsGenerator$4(operations);
	return toCanonicalUrlString(url);
};
var extract$5 = (url) => {
	const parsedUrl = toUrl(url);
	const match = shopifyRegex.exec(parsedUrl.pathname);
	const operations = operationsParser$4(parsedUrl);
	if (match) {
		const [, , , width, height, crop] = match;
		if (width && height && !operations.width && !operations.height) {
			operations.width = parseInt(width, 10);
			operations.height = parseInt(height, 10);
		}
		if (crop) operations.crop ??= crop;
	}
	parsedUrl.pathname = parsedUrl.pathname.replace(shopifyRegex, "$1$6");
	for (const key of [
		"width",
		"height",
		"crop",
		"pad_color",
		"format"
	]) parsedUrl.searchParams.delete(key);
	return {
		src: parsedUrl.toString(),
		operations
	};
};
var transform$5 = createExtractAndGenerate(extract$5, generate$5);
//#endregion
//#region node_modules/unpic/esm/src/providers/storyblok.js
var storyBlokAssets = /(?<id>\/f\/\d+\/\d+x\d+\/\w+\/[^\/]+)\/?(?<modifiers>m\/?(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?)?$/;
var storyBlokImg2 = /^(?<modifiers>\/(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?\/?)?(?<id>\/f\/.+)$/;
var filterSplitterRegex = /:(?![^(]*\))/;
var splitFilters = (filters) => {
	if (!filters) return {};
	return Object.fromEntries(filters.split(filterSplitterRegex).map((filter) => {
		if (!filter) return [];
		const [key, value] = filter.split("(");
		return [key, value.replace(")", "")];
	}));
};
var generateFilters = (filters) => {
	if (!filters) return;
	const filterItems = Object.entries(filters).map(([key, value]) => `${key}(${value ?? ""})`);
	if (filterItems.length === 0) return;
	return `filters:${filterItems.join(":")}`;
};
var extract$4 = (url) => {
	const parsedUrl = toUrl(url);
	const matches = (parsedUrl.hostname === "img2.storyblok.com" ? storyBlokImg2 : storyBlokAssets).exec(parsedUrl.pathname);
	if (!matches || !matches.groups) return null;
	const { id, crop, width, height, filters, flipx, flipy } = matches.groups;
	const { format, ...filterMap } = splitFilters(filters ?? "");
	if (parsedUrl.hostname === "img2.storyblok.com") parsedUrl.hostname = "a.storyblok.com";
	const operations = Object.fromEntries([
		["width", Number(width) || void 0],
		["height", Number(height) || void 0],
		["format", format],
		["crop", crop],
		["filters", filterMap],
		["flipx", flipx],
		["flipy", flipy]
	].filter(([_, value]) => value !== void 0));
	return {
		src: `${parsedUrl.origin}${id}`,
		operations
	};
};
var generate$4 = (src, operations) => {
	const url = toUrl(src);
	const { width = 0, height = 0, format, crop, filters = {}, flipx = "", flipy = "" } = operations;
	const size = `${flipx}${width}x${flipy}${height}`;
	if (format) filters.format = format;
	url.pathname = [
		url.pathname,
		"m",
		crop,
		size,
		generateFilters(filters)
	].filter(Boolean).join("/");
	return toCanonicalUrlString(url);
};
var transform$4 = createExtractAndGenerate(extract$4, generate$4);
//#endregion
//#region node_modules/unpic/esm/src/providers/supabase.js
var STORAGE_URL_PREFIX = "/storage/v1/object/public/";
var RENDER_URL_PREFIX = "/storage/v1/render/image/public/";
var isRenderUrl = (url) => url.pathname.startsWith(RENDER_URL_PREFIX);
var { operationsGenerator: operationsGenerator$3, operationsParser: operationsParser$3 } = createOperationsHandlers({});
var generate$3 = (src, operations) => {
	const url = toUrl(src);
	url.pathname = url.pathname.replace(RENDER_URL_PREFIX, STORAGE_URL_PREFIX);
	if (operations.format && operations.format !== "origin") delete operations.format;
	url.search = operationsGenerator$3(operations);
	return toCanonicalUrlString(url).replace(STORAGE_URL_PREFIX, RENDER_URL_PREFIX);
};
var extract$3 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$3(parsedUrl);
	const isRender = isRenderUrl(parsedUrl);
	const imagePath = parsedUrl.pathname.replace(RENDER_URL_PREFIX, "").replace(STORAGE_URL_PREFIX, "");
	if (!isRender) return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
	return {
		src: `${parsedUrl.origin}${STORAGE_URL_PREFIX}${imagePath}`,
		operations
	};
};
var transform$3 = createExtractAndGenerate(extract$3, generate$3);
//#endregion
//#region node_modules/unpic/esm/src/providers/uploadcare.js
var uploadcareRegex = /^https?:\/\/(?<host>[^\/]+)\/(?<uuid>[^\/]+)(?:\/(?<filename>[^\/]+)?)?/;
var { operationsGenerator: operationsGenerator$2, operationsParser: operationsParser$2 } = createOperationsHandlers({
	keyMap: {
		width: false,
		height: false
	},
	defaults: { format: "auto" },
	kvSeparator: "/",
	paramSeparator: "/-/"
});
var extract$2 = (url) => {
	const parsedUrl = toUrl(url);
	const match = uploadcareRegex.exec(parsedUrl.toString());
	if (!match || !match.groups) return null;
	const { host, uuid } = match.groups;
	const [, ...operationsString] = parsedUrl.pathname.split("/-/");
	const operations = operationsParser$2(operationsString.join("/-/") || "");
	if (operations.resize) {
		const [width, height] = operations.resize.split("x");
		if (width) operations.width = parseInt(width);
		if (height) operations.height = parseInt(height);
		delete operations.resize;
	}
	return {
		src: `https://${host}/${uuid}/`,
		operations,
		options: { host }
	};
};
var generate$2 = (src, operations, options = {}) => {
	const url = toUrl(src);
	const host = options.host || url.hostname;
	const match = uploadcareRegex.exec(url.toString());
	if (match?.groups) url.pathname = `/${match.groups.uuid}/`;
	operations.resize = operations.resize || `${operations.width ?? ""}x${operations.height ?? ""}`;
	delete operations.width;
	delete operations.height;
	const modifiers = addTrailingSlash(operationsGenerator$2(operations));
	url.hostname = host;
	url.pathname = stripTrailingSlash(url.pathname) + (modifiers ? `/-/${modifiers}` : "") + (match?.groups?.filename ?? "");
	return toCanonicalUrlString(url);
};
var transform$2 = createExtractAndGenerate(extract$2, generate$2);
//#endregion
//#region node_modules/unpic/esm/src/providers/wordpress.js
var { operationsGenerator: operationsGenerator$1, operationsParser: operationsParser$1 } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h"
	},
	defaults: { crop: "1" }
});
var generate$1 = (src, operations) => {
	const url = toUrl(src);
	const { crop } = operations;
	if (typeof crop !== "undefined" && crop !== "0") operations.crop = crop ? "1" : "0";
	url.search = operationsGenerator$1(operations);
	return toCanonicalUrlString(url);
};
var extract$1 = (url) => {
	const parsedUrl = toUrl(url);
	const operations = operationsParser$1(parsedUrl);
	if (operations.crop !== void 0) operations.crop = operations.crop === "1";
	parsedUrl.search = "";
	return {
		src: toCanonicalUrlString(parsedUrl),
		operations
	};
};
var transform$1 = createExtractAndGenerate(extract$1, generate$1);
//#endregion
//#region node_modules/unpic/esm/src/providers/wsrv.js
var { operationsGenerator, operationsParser } = createOperationsHandlers({
	keyMap: {
		width: "w",
		height: "h",
		format: "output",
		quality: "q"
	},
	defaults: { fit: "cover" }
});
var extract = (url) => {
	const urlObj = toUrl(url);
	const srcParam = urlObj.searchParams.get("url");
	if (!srcParam) return null;
	let src = srcParam;
	if (!src.startsWith("http://") && !src.startsWith("https://")) src = "https://" + src;
	urlObj.searchParams.delete("url");
	const operations = operationsParser(urlObj);
	return {
		src,
		operations
	};
};
var generate = (src, operations) => {
	const url = new URL("https://wsrv.nl/");
	const cleanSrc = (typeof src === "string" ? src : src.toString()).replace(/^https?:\/\//, "");
	url.searchParams.set("url", cleanSrc);
	const params = operationsGenerator(operations);
	const searchParams = new URLSearchParams(params);
	for (const [key, value] of searchParams) if (key !== "url") url.searchParams.set(key, value);
	return toCanonicalUrlString(url);
};
//#endregion
//#region node_modules/unpic/esm/src/transform.js
var transformerMap = {
	appwrite: transform$27,
	astro: transform$26,
	"builder.io": transform$25,
	bunny: transform$24,
	cloudflare: transform$23,
	cloudflare_images: transform$22,
	cloudimage: transform$21,
	cloudinary: transform$20,
	contentful: transform$19,
	contentstack: transform$18,
	directus: transform$17,
	hygraph: transform$16,
	imageengine: transform$15,
	imagekit: transform$14,
	imgix: transform$13,
	ipx: transform$12,
	keycdn: transform$11,
	"kontent.ai": transform$10,
	netlify: transform$9,
	nextjs: transform$7,
	scene7: transform$6,
	shopify: transform$5,
	storyblok: transform$4,
	supabase: transform$3,
	uploadcare: transform$2,
	vercel: transform$8,
	wordpress: transform$1,
	wsrv: createExtractAndGenerate(extract, generate)
};
/**
* Returns a transformer function if the given CDN is supported
*/
function getTransformerForCdn(cdn) {
	if (!cdn) return;
	return transformerMap[cdn];
}
//#endregion
//#region node_modules/@unpic/core/dist/auto.mjs
function transformProps({ cdn, fallback, operations = {}, options, ...props }) {
	cdn ??= getProviderForUrl(props.src) || fallback;
	if (!cdn) return props;
	const transformer = getTransformerForCdn(cdn);
	if (!transformer) return props;
	return transformBaseImageProps({
		...props,
		operations: operations?.[cdn],
		options: options?.[cdn],
		transformer
	});
}
function transformSourceProps({ cdn, fallback, operations, options, ...props }) {
	cdn ??= getProviderForUrl(props.src) || fallback;
	if (!cdn) return props;
	const transformer = getTransformerForCdn(cdn);
	if (!transformer) return props;
	return transformBaseSourceProps({
		...props,
		operations: operations?.[cdn],
		options: options?.[cdn],
		transformer
	});
}
//#endregion
//#region node_modules/@unpic/react/dist/chunk-SNIEDJZS.mjs
var Image$1 = import_react.forwardRef(function Image2(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		...camelizeProps(transformProps(props)),
		ref
	});
});
import_react.forwardRef(function Source2(props, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
		...camelizeProps(transformSourceProps(props)),
		ref
	});
});
//#endregion
//#region node_modules/vinext/dist/shims/image.js
/**
* next/image shim
*
* Translates Next.js Image props to @unpic/react Image component.
* @unpic/react auto-detects CDN from URL and uses native transforms.
* For local images (relative paths), routes through `/_vinext/image`
* for server-side optimization (resize, format negotiation, quality).
*
* Remote images are validated against `images.remotePatterns` and
* `images.domains` from next.config.js. Unmatched URLs are blocked
* in production and warn in development, matching Next.js behavior.
*/
/**
* Image config injected at build time via Vite define.
* Serialized as JSON — parsed once at module level.
*/
var __imageRemotePatterns = (() => {
	try {
		return JSON.parse("[]");
	} catch {
		return [];
	}
})();
var __imageDomains = (() => {
	try {
		return JSON.parse("[]");
	} catch {
		return [];
	}
})();
var __hasImageConfig = __imageRemotePatterns.length > 0 || __imageDomains.length > 0;
var __imageDeviceSizes = (() => {
	try {
		return JSON.parse("[640,750,828,1080,1200,1920,2048,3840]");
	} catch {
		return [
			640,
			750,
			828,
			1080,
			1200,
			1920,
			2048,
			3840
		];
	}
})();
/**
* Validate that a remote URL is allowed by the configured remote patterns.
* Returns true if the URL is allowed, false otherwise.
*
* When no remotePatterns/domains are configured, all remote URLs are allowed
* (backwards-compatible — user hasn't opted into restriction).
*
* When patterns ARE configured, only matching URLs are allowed.
* In development, non-matching URLs produce a console warning.
* In production, non-matching URLs are blocked (src replaced with empty string).
*
* Private-IP hostnames are additionally rejected unless dangerouslyAllowLocalIP
* is set, mirroring Next.js's fetchExternalImage guard.
*/
function validateRemoteUrl(src) {
	let url;
	try {
		url = new URL(src, "http://n");
	} catch {
		return {
			allowed: false,
			reason: `Invalid URL: ${src}`
		};
	}
	if (isPrivateIp(url.hostname)) return {
		allowed: false,
		reason: `Image URL "${src}" resolved to private IP. If this is expected and you understand SSRF risk, use images.dangerouslyAllowLocalIP = true to continue.`
	};
	if (!__hasImageConfig) return { allowed: true };
	if (hasRemoteMatch(__imageDomains, __imageRemotePatterns, url)) return { allowed: true };
	return {
		allowed: false,
		reason: `Image URL "${src}" is not configured in images.remotePatterns or images.domains in next.config.js. See: https://nextjs.org/docs/messages/next-image-unconfigured-host`
	};
}
/**
* A version of useLayoutEffect that doesn't warn during SSR.
* Do not rename this to "isomorphic layout effect". There is no such thing as
* an isomorphic Layout Effect since there is no Layout on the server.
* Ported from Next.js: https://github.com/vercel/next.js/pull/93209
*/
var useNonWarningLayoutEffect = typeof window === "undefined" ? import_react.useEffect : import_react.useLayoutEffect;
/**
* Create a synthetic React load event for replaying onLoad/onLoadingComplete
* during hydration when the image already completed loading.
*
* This function creates a native Event("load") via the DOM Event constructor
* and must only be called in a browser context (client-side layout effect).
* It mirrors the pattern used in Next.js `handleLoading`.
*/
function createSyntheticLoadEvent(img) {
	const nativeEvent = new Event("load");
	Object.defineProperty(nativeEvent, "target", {
		writable: false,
		value: img
	});
	let prevented = false;
	let stopped = false;
	return {
		bubbles: nativeEvent.bubbles,
		cancelable: nativeEvent.cancelable,
		currentTarget: img,
		defaultPrevented: false,
		eventPhase: nativeEvent.eventPhase,
		isTrusted: false,
		nativeEvent,
		target: img,
		timeStamp: nativeEvent.timeStamp,
		type: "load",
		isDefaultPrevented: () => prevented,
		isPropagationStopped: () => stopped,
		persist: () => {},
		preventDefault: () => {
			prevented = true;
			nativeEvent.preventDefault();
		},
		stopPropagation: () => {
			stopped = true;
			nativeEvent.stopPropagation();
		}
	};
}
/**
* Sanitize a blurDataURL to prevent CSS injection.
*
* A crafted data URL containing `)` can break out of the `url()` CSS function,
* allowing injection of arbitrary CSS properties or rules. Characters like `{`,
* `}`, and `\` can also assist in crafting injection payloads.
*
* This validates the URL starts with `data:image/` and rejects characters that
* could escape the `url()` context. Semicolons are allowed since they're part
* of valid data URLs (`data:image/png;base64,...`) and harmless inside `url()`.
*
* Returns undefined for invalid URLs, which causes the blur placeholder to be
* skipped gracefully.
*/
function sanitizeBlurDataURL(url) {
	if (!url.startsWith("data:image/")) return void 0;
	if (/[)(}{\\'"\n\r]/.test(url)) return void 0;
	return url;
}
/**
* Determine if a src is a remote URL (CDN-optimizable) or local.
*/
function isRemoteUrl(src) {
	return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//");
}
/**
* Resolve src, width, height, blurDataURL from Image props (string or StaticImageData).
* Shared by the Image component and getImageProps to keep behavior in sync.
*/
function resolveImageSource(v) {
	return {
		src: typeof v.src === "string" ? v.src : v.src.src,
		width: v.width ?? (typeof v.src === "object" ? v.src.width : void 0),
		height: v.height ?? (typeof v.src === "object" ? v.src.height : void 0),
		blurDataURL: v.blurDataURL ?? (typeof v.src === "object" ? v.src.blurDataURL : void 0)
	};
}
/**
* Responsive image widths matching Next.js's device sizes config.
* These are the breakpoints used for srcSet generation.
* Configurable via `images.deviceSizes` in next.config.js.
*/
var RESPONSIVE_WIDTHS = __imageDeviceSizes;
/**
* Build a `/_vinext/image` optimization URL.
*
* In production (Cloudflare Workers), the worker intercepts this path and uses
* the Images binding to resize/transcode on the fly. In dev, the Vite dev
* server handles it as a passthrough (serves the original file).
*/
function imageOptimizationUrl(src, width, quality = 75) {
	return `/_vinext/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
/**
* Generate a srcSet string for responsive images.
*
* Each width points to the `/_vinext/image` optimization endpoint so the
* server can resize and transcode the image. Only includes widths that are
* <= 2x the original image width to avoid pointless upscaling.
*/
function generateSrcSet(src, originalWidth, quality = 75) {
	const widths = RESPONSIVE_WIDTHS.filter((w) => w <= originalWidth * 2);
	if (widths.length === 0) return `${imageOptimizationUrl(src, originalWidth, quality)} ${originalWidth}w`;
	return widths.map((w) => `${imageOptimizationUrl(src, w, quality)} ${w}w`).join(", ");
}
var Image = (0, import_react.forwardRef)(function Image({ src: srcProp, alt, width, height, fill, priority, quality, placeholder, blurDataURL, loader, sizes, className, style, onLoad, onLoadingComplete, onError, unoptimized: _unoptimized, overrideSrc: _overrideSrc, loading, ...rest }, ref) {
	const lastLoadedSrcRef = (0, import_react.useRef)(void 0);
	const lastErrorSrcRef = (0, import_react.useRef)(void 0);
	const didInsertRef = (0, import_react.useRef)(false);
	const imgElementRef = (0, import_react.useRef)(null);
	const mergedRef = useMergedRef(ref, imgElementRef);
	const onLoadRef = (0, import_react.useRef)(onLoad);
	(0, import_react.useEffect)(() => {
		onLoadRef.current = onLoad;
	}, [onLoad]);
	const onErrorRef = (0, import_react.useRef)(onError);
	(0, import_react.useEffect)(() => {
		onErrorRef.current = onError;
	}, [onError]);
	const onLoadingCompleteRef = (0, import_react.useRef)(onLoadingComplete);
	(0, import_react.useEffect)(() => {
		onLoadingCompleteRef.current = onLoadingComplete;
	}, [onLoadingComplete]);
	const { src, width: imgWidth, height: imgHeight, blurDataURL: imgBlurDataURL } = resolveImageSource({
		src: srcProp,
		width,
		height,
		blurDataURL
	});
	useNonWarningLayoutEffect(() => {
		if (!didInsertRef.current && imgElementRef.current !== null) {
			const img = imgElementRef.current;
			if (onErrorRef.current) img.src = img.src;
			if (img.complete && img.naturalWidth > 0) {
				const currentOnLoad = onLoadRef.current;
				const currentOnLoadingComplete = onLoadingCompleteRef.current;
				if (currentOnLoad || currentOnLoadingComplete) {
					if (lastLoadedSrcRef.current !== src) {
						lastLoadedSrcRef.current = src;
						const syntheticEvent = createSyntheticLoadEvent(img);
						currentOnLoad?.(syntheticEvent);
						currentOnLoadingComplete?.(img);
					}
				}
			}
			didInsertRef.current = true;
		}
	}, [
		placeholder,
		sizes,
		_unoptimized
	]);
	const handleLoad = onLoadingComplete ? (e) => {
		if (lastLoadedSrcRef.current === src) return;
		lastLoadedSrcRef.current = src;
		onLoad?.(e);
		onLoadingComplete(e.currentTarget);
	} : onLoad ? (e) => {
		if (lastLoadedSrcRef.current === src) return;
		lastLoadedSrcRef.current = src;
		onLoad(e);
	} : void 0;
	const handleError = onError ? (e) => {
		if (lastErrorSrcRef.current === src) return;
		lastErrorSrcRef.current = src;
		onError(e);
	} : void 0;
	if (loader) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		ref: mergedRef,
		src: loader({
			src,
			width: imgWidth ?? 0,
			quality: quality ?? 75
		}),
		alt,
		width: fill ? void 0 : imgWidth,
		height: fill ? void 0 : imgHeight,
		loading: priority ? "eager" : loading ?? "lazy",
		decoding: "async",
		sizes,
		className,
		onLoad: handleLoad,
		onError: handleError,
		style: fill ? {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...style
		} : style,
		...rest
	});
	if (isRemoteUrl(src)) {
		const validation = validateRemoteUrl(src);
		if (!validation.allowed) {
			console.error(`[next/image] ${validation.reason}`);
			return null;
		}
		const sanitizedBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
		const bg = placeholder === "blur" && sanitizedBlur ? `url(${sanitizedBlur})` : void 0;
		if (fill) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
			src,
			alt,
			layout: "fullWidth",
			loading: priority ? "eager" : loading ?? "lazy",
			fetchPriority: priority ? "high" : void 0,
			sizes,
			className,
			background: bg,
			onLoad: handleLoad,
			onError: handleError,
			ref: mergedRef
		});
		if (imgWidth && imgHeight) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
			src,
			alt,
			width: imgWidth,
			height: imgHeight,
			layout: "constrained",
			loading: priority ? "eager" : loading ?? "lazy",
			fetchPriority: priority ? "high" : void 0,
			sizes,
			className,
			background: bg,
			onLoad: handleLoad,
			onError: handleError,
			ref: mergedRef
		});
	}
	const imgQuality = quality ?? 75;
	const isSvg = src.endsWith(".svg");
	const skipOptimization = _unoptimized === true || isSvg && true;
	const srcSet = imgWidth && !fill && !skipOptimization ? generateSrcSet(src, imgWidth, imgQuality) : imgWidth && !fill ? RESPONSIVE_WIDTHS.filter((w) => w <= imgWidth * 2).map((w) => `${src} ${w}w`).join(", ") || `${src} ${imgWidth}w` : void 0;
	const optimizedSrc = skipOptimization ? src : imgWidth ? imageOptimizationUrl(src, imgWidth, imgQuality) : imageOptimizationUrl(src, RESPONSIVE_WIDTHS[0], imgQuality);
	const sanitizedLocalBlur = imgBlurDataURL ? sanitizeBlurDataURL(imgBlurDataURL) : void 0;
	const blurStyle = placeholder === "blur" && sanitizedLocalBlur ? {
		backgroundImage: `url(${sanitizedLocalBlur})`,
		backgroundSize: "cover",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "center"
	} : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		ref: mergedRef,
		src: optimizedSrc,
		alt,
		width: fill ? void 0 : imgWidth,
		height: fill ? void 0 : imgHeight,
		loading: priority ? "eager" : loading ?? "lazy",
		fetchPriority: priority ? "high" : void 0,
		decoding: "async",
		srcSet,
		sizes: sizes ?? (fill ? "100vw" : void 0),
		className,
		"data-nimg": fill ? "fill" : "1",
		onLoad: handleLoad,
		onError: handleError,
		style: fill ? {
			position: "absolute",
			inset: 0,
			width: "100%",
			height: "100%",
			objectFit: "cover",
			...blurStyle,
			...style
		} : {
			...blurStyle,
			...style
		},
		...rest
	});
});
function migrateSave(raw) {
	const defaults = {
		version: 4,
		playerName: "Captain Rowan",
		level: 1,
		xp: 0,
		gold: 2600,
		pearls: 30,
		hp: 1250,
		maxHp: 1250,
		shield: 350,
		maxShield: 350,
		mapId: "aster",
		ammo: {
			iron: 999,
			piercing: 45,
			fire: 35,
			frost: 25,
			harpoon: 80
		},
		cannonLevel: 1,
		harpoonLevel: 1,
		repairKits: 3,
		progress: {},
		completed: [],
		visited: ["aster"],
		materials: 0,
		shipId: "sovereign",
		ownedShips: ["sovereign"],
		cannonId: "bronze",
		ownedCannons: ["bronze"],
		mojos: 3,
		cauldronPity: 0,
		mapFragments: 0,
		lastFreeRitual: "",
		deckLevel: 1,
		hullLevel: 1,
		sailLevel: 1,
		crewLevel: 1,
		talentPoints: 0,
		settings: { qualityProfile: "AUTO" }
	};
	return {
		...defaults,
		...raw,
		version: 4,
		ammo: {
			...defaults.ammo,
			...raw.ammo
		},
		progress: {
			...defaults.progress,
			...raw.progress
		},
		completed: [...raw.completed ?? defaults.completed],
		visited: [...raw.visited ?? defaults.visited],
		ownedShips: [...raw.ownedShips ?? defaults.ownedShips ?? ["sovereign"]],
		ownedCannons: [...raw.ownedCannons ?? defaults.ownedCannons ?? ["bronze"]],
		settings: {
			...defaults.settings,
			...raw.settings
		}
	};
}
//#endregion
//#region app/game/save/indexedDbRepository.ts
var DATABASE_NAME = "abyssal-dominion";
var STORE_NAME = "profiles";
var DEFAULT_PROFILE = "captain";
var openDatabase = () => new Promise((resolve, reject) => {
	const request = indexedDB.open(DATABASE_NAME, 3);
	request.onupgradeneeded = () => {
		if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
	};
	request.onsuccess = () => resolve(request.result);
	request.onerror = () => reject(request.error);
});
var IndexedDbSaveGameRepository = class {
	async load(profileId = DEFAULT_PROFILE) {
		try {
			const database = await openDatabase();
			const raw = await new Promise((resolve, reject) => {
				const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(profileId);
				request.onsuccess = () => resolve(request.result ?? null);
				request.onerror = () => reject(request.error);
			});
			return raw ? migrateSave(raw) : null;
		} catch {
			return null;
		}
	}
	async write(save, profileId = DEFAULT_PROFILE) {
		const database = await openDatabase();
		await new Promise((resolve, reject) => {
			const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(migrateSave(save), profileId);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
	async remove(profileId = DEFAULT_PROFILE) {
		const database = await openDatabase();
		await new Promise((resolve, reject) => {
			const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(profileId);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
};
//#endregion
//#region app/saveGame.ts
var repository = new IndexedDbSaveGameRepository();
var loadSave = () => repository.load();
var writeSave = (save) => repository.write(save);
var resetSave = () => repository.remove();
//#endregion
//#region app/game/core/math.ts
var clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
var distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);
var normalizeAngle = (value) => {
	let angle = value;
	while (angle > Math.PI) angle -= Math.PI * 2;
	while (angle < -Math.PI) angle += Math.PI * 2;
	return angle;
};
//#endregion
//#region app/game/navigation/navalTurnProfile.ts
/** Relative angle between ship forward and target (0–180°). */
function relativeTargetAngleDeg(shipAngle, targetAngle) {
	return Math.abs(normalizeAngle(targetAngle - shipAngle)) * 180 / Math.PI;
}
/**
* V20.3.1 hybrid naval turning — forward-only, tighter hard turns behind ship.
* Parameters are intentionally grouped for future CLASSIC/RESPONSIVE modes.
*/
function resolveNavalTurnProfile(shipAngle, targetAngle) {
	const deg = relativeTargetAngleDeg(shipAngle, targetAngle);
	if (deg <= 45) return {
		relativeTargetAngleDeg: deg,
		turnMode: "forward",
		turnAuthority: 1,
		forwardThrustFactor: 1
	};
	if (deg <= 100) {
		const t = (deg - 45) / 55;
		return {
			relativeTargetAngleDeg: deg,
			turnMode: "arc",
			turnAuthority: 1 + t * .12,
			forwardThrustFactor: 1 - t * .22
		};
	}
	if (deg <= 140) {
		const t = (deg - 100) / 40;
		return {
			relativeTargetAngleDeg: deg,
			turnMode: "tight",
			turnAuthority: 1.12 + t * .38,
			forwardThrustFactor: .78 - t * .38
		};
	}
	const t = clamp((deg - 140) / 40, 0, 1);
	return {
		relativeTargetAngleDeg: deg,
		turnMode: "hard",
		turnAuthority: 1.5 + t * .35,
		forwardThrustFactor: .4 - t * .2
	};
}
function applyNavalTurnInput(angleDiff, profile, baseTurnGain = 2.4) {
	return {
		turn: clamp(angleDiff * baseTurnGain * profile.turnAuthority, -1, 1),
		thrustScale: clamp(profile.forwardThrustFactor, .2, 1)
	};
}
//#endregion
//#region app/game/navigation/shipMovement.ts
var ARRIVAL_RADIUS = 36;
var STUCK_SECONDS = 1.35;
var STUCK_MIN_PROGRESS = 14;
var ISLAND_MARGIN = .82;
var ISLAND_SOFT = .9;
function insideIsland(x, y, island, margin) {
	const dx = (x - island.x) / island.rx;
	const dy = (y - island.y) / island.ry;
	return dx * dx + dy * dy < margin * margin;
}
function blockedAt(x, y, islands, margin = ISLAND_MARGIN) {
	return islands.some((island) => insideIsland(x, y, island, margin));
}
function segmentBlocked(a, b, islands) {
	const len = distance(a, b);
	const steps = Math.max(6, Math.ceil(len / 36));
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		if (blockedAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, islands)) return true;
	}
	return false;
}
function findDetour(from, goal, islands) {
	const blocking = islands.filter((island) => segmentBlocked(from, goal, [island]));
	if (!blocking.length) return null;
	const isle = blocking.reduce((best, island) => {
		const d = distance({
			x: island.x,
			y: island.y
		}, from);
		return !best || d < distance({
			x: best.x,
			y: best.y
		}, from) ? island : best;
	}, blocking[0]);
	const perpX = goal.y - from.y;
	const perpY = -(goal.x - from.x);
	const perpLen = Math.hypot(perpX, perpY) || 1;
	const pad = Math.max(isle.rx, isle.ry) * 1.22;
	const candidates = [
		{
			x: isle.x + perpX / perpLen * pad,
			y: isle.y + perpY / perpLen * pad
		},
		{
			x: isle.x - perpX / perpLen * pad,
			y: isle.y - perpY / perpLen * pad
		},
		{
			x: isle.x + ((from.x - isle.x) / Math.hypot(from.x - isle.x, from.y - isle.y) || 1) * pad,
			y: isle.y + ((from.y - isle.y) / Math.hypot(from.x - isle.x, from.y - isle.y) || 1) * pad
		}
	];
	for (const candidate of candidates) {
		if (blockedAt(candidate.x, candidate.y, islands, ISLAND_SOFT)) continue;
		if (!segmentBlocked(from, candidate, islands) && !segmentBlocked(candidate, goal, islands)) return candidate;
	}
	const dx = from.x - isle.x;
	const dy = from.y - isle.y;
	const dlen = Math.hypot(dx, dy) || 1;
	return {
		x: isle.x + dx / dlen * pad,
		y: isle.y + dy / dlen * pad
	};
}
function createNavigationState(anchor) {
	return {
		ultimateDestination: null,
		detourWaypoint: null,
		stuckTimer: 0,
		stuckAnchorX: anchor.x,
		stuckAnchorY: anchor.y
	};
}
function planNavigationTo(goal, from, islands) {
	const navigation = createNavigationState(from);
	navigation.ultimateDestination = goal;
	if (!segmentBlocked(from, goal, islands)) return {
		destination: goal,
		navigation
	};
	const detour = findDetour(from, goal, islands);
	if (!detour) return {
		destination: goal,
		navigation
	};
	navigation.detourWaypoint = detour;
	return {
		destination: detour,
		navigation
	};
}
function stepShipMovement(config) {
	const player = { ...config.player };
	const navigation = { ...config.navigation };
	let destination = config.destination;
	let turn = config.keyboardTurn;
	let thrust = config.keyboardThrust;
	let movementDebug;
	if (destination) {
		const d = distance(player, destination);
		const targetAngle = Math.atan2(destination.y - player.y, destination.x - player.x);
		const angleDiff = normalizeAngle(targetAngle - player.angle);
		const turnProfile = resolveNavalTurnProfile(player.angle, targetAngle);
		const navalTurn = applyNavalTurnInput(angleDiff, turnProfile);
		turn = navalTurn.turn;
		const turningFactor = navalTurn.thrustScale;
		thrust = d > ARRIVAL_RADIUS ? turningFactor : 0;
		movementDebug = {
			relativeTargetAngle: turnProfile.relativeTargetAngleDeg,
			turnMode: turnProfile.turnMode,
			turnAuthority: turnProfile.turnAuthority,
			forwardThrustFactor: turnProfile.forwardThrustFactor,
			targetDistance: d
		};
		if (d < ARRIVAL_RADIUS) if (navigation.detourWaypoint && navigation.ultimateDestination) {
			navigation.detourWaypoint = null;
			destination = navigation.ultimateDestination;
		} else {
			destination = null;
			navigation.ultimateDestination = null;
			player.speed *= .5;
		}
	}
	player.angle += turn * config.shipTurnRate * config.dt;
	const desiredSpeed = thrust * config.shipMaxSpeed * config.sailBonus * config.surgeMultiplier;
	player.speed += (desiredSpeed - player.speed) * config.dt * 2.55;
	player.speed *= Math.pow(.991, config.dt * 60);
	const nx = player.x + Math.cos(player.angle) * player.speed * config.dt;
	const ny = player.y + Math.sin(player.angle) * player.speed * config.dt;
	if (!blockedAt(nx, ny, config.islands)) {
		player.x = clamp(nx, 50, config.mapWidth - 50);
		player.y = clamp(ny, 50, config.mapHeight - 50);
		if (distance({
			x: navigation.stuckAnchorX,
			y: navigation.stuckAnchorY
		}, player) > STUCK_MIN_PROGRESS || Math.abs(player.speed) < 8) {
			navigation.stuckTimer = 0;
			navigation.stuckAnchorX = player.x;
			navigation.stuckAnchorY = player.y;
		} else if (destination && Math.abs(player.speed) > 12) navigation.stuckTimer += config.dt;
	} else {
		player.speed *= -.12;
		navigation.stuckTimer += config.dt;
		if (navigation.stuckTimer > STUCK_SECONDS && navigation.ultimateDestination) {
			const replanned = planNavigationTo(navigation.ultimateDestination, player, config.islands);
			destination = replanned.destination;
			navigation.ultimateDestination = replanned.navigation.ultimateDestination;
			navigation.detourWaypoint = replanned.navigation.detourWaypoint;
			navigation.stuckTimer = 0;
			navigation.stuckAnchorX = player.x;
			navigation.stuckAnchorY = player.y;
		} else if (navigation.ultimateDestination && !navigation.detourWaypoint) {
			const detour = findDetour(player, navigation.ultimateDestination, config.islands);
			if (detour) {
				navigation.detourWaypoint = detour;
				destination = detour;
			}
		}
	}
	return {
		player,
		destination,
		navigation,
		movementDebug
	};
}
//#endregion
//#region app/game/core/state.ts
var MONSTER_KINDS = new Set([
	"kraken",
	"serpent",
	"leviathan",
	"boss"
]);
var deckData = (level) => DECK_LEVELS[clamp(Math.round(level), 1, 6)];
var durability = (shipId, deckLevel, hullLevel = 1) => {
	const ship = SHIPS[shipId];
	const deck = deckData(deckLevel);
	const hullBonus = Math.max(0, hullLevel - 1) * .08;
	return {
		hp: Math.round(ship.hp * (1 + deck.hpBonus + hullBonus)),
		shield: Math.round(ship.shield * (1 + deck.shieldBonus + hullBonus * .45))
	};
};
var freshSave = () => ({
	version: 4,
	playerName: "Captain Rowan",
	level: 1,
	xp: 0,
	gold: 2600,
	pearls: 30,
	hp: 1250,
	maxHp: 1250,
	shield: 350,
	maxShield: 350,
	mapId: "aster",
	ammo: {
		iron: 999,
		piercing: 45,
		fire: 35,
		frost: 25,
		harpoon: 80
	},
	cannonLevel: 1,
	harpoonLevel: 1,
	repairKits: 3,
	progress: {},
	completed: [],
	visited: ["aster"],
	materials: 0,
	shipId: "sovereign",
	ownedShips: ["sovereign"],
	cannonId: "bronze",
	ownedCannons: ["bronze"],
	mojos: 3,
	cauldronPity: 0,
	mapFragments: 0,
	lastFreeRitual: "",
	deckLevel: 1,
	hullLevel: 1,
	sailLevel: 1,
	crewLevel: 1,
	talentPoints: 0,
	settings: { qualityProfile: "AUTO" }
});
function spawnMap(mapId, bonusBoss = false) {
	const spawned = MAPS[mapId].enemies.map((spawn, index) => {
		const definition = ENTITY_DATA[spawn.kind];
		return {
			id: Date.now() + index,
			kind: spawn.kind,
			x: spawn.x,
			y: spawn.y,
			angle: index * .9,
			hp: definition.hp,
			maxHp: definition.hp,
			fireAt: 0,
			hitAt: 0,
			statusUntil: 0,
			phase: 1
		};
	});
	if (bonusBoss) {
		const boss = ENTITY_DATA.boss;
		spawned.push({
			id: Date.now() + 99,
			kind: "boss",
			x: 2350,
			y: 900,
			angle: Math.PI,
			hp: boss.hp,
			maxHp: boss.hp,
			fireAt: 0,
			hitAt: 0,
			statusUntil: 0,
			phase: 1
		});
	}
	return spawned;
}
var createRuntimeState = () => ({
	running: false,
	mapId: "aster",
	shipId: "sovereign",
	playerName: "Captain Rowan",
	playerLevel: 1,
	deckLevel: 1,
	weaponSlots: 12,
	expansionSlots: 6,
	player: {
		x: 680,
		y: 900,
		angle: 0,
		hp: 1250,
		maxHp: 1250,
		shield: 350,
		maxShield: 350,
		speed: 0
	},
	destination: null,
	navigation: createNavigationState({
		x: 680,
		y: 900
	}),
	movementDebug: null,
	entities: spawnMap("aster"),
	shots: [],
	loot: [],
	wake: [],
	actions: /* @__PURE__ */ new Set(),
	selectedId: null,
	autoFire: false,
	lastShot: 0,
	lastHit: 0,
	lastTime: 0,
	kills: 0,
	monsterKills: 0,
	lootCount: 0,
	wave: 1,
	zoom: .96,
	cameraPan: {
		x: 0,
		y: 0
	},
	joystick: {
		x: 0,
		y: 0
	},
	surgeUntil: 0,
	surgeReady: 0,
	aegisReady: 0,
	volleyReady: 0
});
//#endregion
//#region app/game/input/actions.ts
var KEYBOARD_ACTIONS = {
	w: "moveForward",
	arrowup: "moveForward",
	s: "moveBackward",
	arrowdown: "moveBackward",
	a: "steerLeft",
	arrowleft: "steerLeft",
	d: "steerRight",
	arrowright: "steerRight",
	tab: "cycleTarget",
	c: "cancelNavigation",
	escape: "closePanel",
	"1": "ability1",
	"2": "ability2",
	"3": "ability3",
	m: "openMap",
	v: "openShipyard",
	e: "interact",
	"+": "zoomIn",
	"-": "zoomOut"
};
function resolveKeyboardAction(event) {
	if (event.code === "Space") return "primaryFire";
	return KEYBOARD_ACTIONS[event.key.toLowerCase()] ?? null;
}
var CONTINUOUS_ACTIONS = new Set([
	"moveForward",
	"moveBackward",
	"steerLeft",
	"steerRight"
]);
//#endregion
//#region app/game/combat/calculations.ts
function calculateBroadside(snapshot) {
	const ammo = AMMO[snapshot.ammoId];
	const cannon = CANNONS[snapshot.cannonId];
	const ship = SHIPS[snapshot.shipId];
	const crewBonus = 1 + Math.max(0, snapshot.crewLevel - 1) * .035;
	const weaponLevel = snapshot.ammoId === "harpoon" ? snapshot.harpoonLevel : snapshot.cannonLevel;
	const armorBonus = snapshot.ammoId === "piercing" && ENTITY_DATA[snapshot.targetKind].armored ? 1.35 : 1;
	const projectileCount = snapshot.ammoId === "harpoon" ? 1 : Math.min(4, 2 + Math.floor((snapshot.deckLevel - 1) / 2));
	const broadsideDamage = ammo.damage * cannon.damage * ship.damage * crewBonus * (1 + (weaponLevel - 1) * .12) * armorBonus;
	return {
		reloadMs: ammo.reload * cannon.reload * 1e3 / (1 + (snapshot.cannonLevel - 1) * .04) / crewBonus,
		range: ammo.range * cannon.range,
		projectileCount,
		projectileDamage: broadsideDamage * (snapshot.ammoId === "harpoon" ? 1 : 2 / projectileCount)
	};
}
//#endregion
//#region app/game/economy/pricing.ts
function purchasePrice(what, save) {
	return {
		repair: 600,
		iron: 300,
		piercing: 850,
		cannon: 1600 * save.cannonLevel,
		harpoon: 1400 * save.harpoonLevel,
		mojo: 500,
		hull: 1250 * (save.hullLevel ?? 1),
		sails: 1100 * (save.sailLevel ?? 1),
		crew: 1500 * (save.crewLevel ?? 1)
	}[what];
}
//#endregion
//#region app/game/progression/missionRewards.ts
var GOLD_REWARDS = {
	"first-blood": 900,
	salvager: 1200,
	cartographer: 1500,
	shipwright: 2e3
};
var PEARL_REWARDS = {
	"deep-hunt": 40,
	"storm-vanguard": 75,
	shipwright: 5
};
function grantMissionReward(save, missionId) {
	save.gold += GOLD_REWARDS[missionId] ?? 0;
	save.pearls += PEARL_REWARDS[missionId] ?? 0;
	if (missionId === "ritualist") save.mapFragments = (save.mapFragments ?? 0) + 1;
	save.xp += missionId === "first-blood" ? 250 : missionId === "deep-hunt" || missionId === "ritualist" ? 350 : 200;
}
//#endregion
//#region app/game/settings/cameraSettings.ts
var CAMERA_PAN_SPEEDS = {
	slow: 520,
	normal: 760,
	fast: 1080
};
var ZOOM_SENSITIVITY = {
	low: .82,
	normal: 1,
	high: 1.22
};
var CAMERA_PAN_KEY = "abyssal-camera-pan-speed";
var ZOOM_SENS_KEY = "abyssal-zoom-sensitivity";
function resolveCameraPanSpeed(preference) {
	return CAMERA_PAN_SPEEDS[preference] ?? CAMERA_PAN_SPEEDS.normal;
}
function resolveZoomSensitivity(preference) {
	return ZOOM_SENSITIVITY[preference] ?? ZOOM_SENSITIVITY.normal;
}
function loadCameraPanSpeed() {
	if (typeof localStorage === "undefined") return "normal";
	const value = localStorage.getItem(CAMERA_PAN_KEY);
	return value === "slow" || value === "fast" ? value : "normal";
}
function saveCameraPanSpeed(value) {
	if (typeof localStorage !== "undefined") localStorage.setItem(CAMERA_PAN_KEY, value);
}
function loadZoomSensitivity() {
	if (typeof localStorage === "undefined") return "normal";
	const value = localStorage.getItem(ZOOM_SENS_KEY);
	return value === "low" || value === "high" ? value : "normal";
}
function saveZoomSensitivity(value) {
	if (typeof localStorage !== "undefined") localStorage.setItem(ZOOM_SENS_KEY, value);
}
//#endregion
//#region app/page.tsx
var SHIP_ART = {
	sovereign: "/assets/sovereign-frigate-v2.webp",
	tempest: "/assets/tempest-corsair-v2.webp",
	ironclad: "/assets/iron-crown-v2.webp",
	arcanum: "/assets/arcanum-depth-v2.webp"
};
var monsters = MONSTER_KINDS;
function Home() {
	const canvasRef = (0, import_react.useRef)(null), threeCanvasRef = (0, import_react.useRef)(null), renderer3DRef = (0, import_react.useRef)(null), fileRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false), [started, setStarted] = (0, import_react.useState)(false), [panel, setPanel] = (0, import_react.useState)(null), [death, setDeath] = (0, import_react.useState)(null);
	const [runtimeError, setRuntimeError] = (0, import_react.useState)(""), [playerVisualStatus, setPlayerVisualStatus] = (0, import_react.useState)(null);
	const [ammo, setAmmo] = (0, import_react.useState)("piercing"), [autoFire, setAutoFire] = (0, import_react.useState)(false), [toasts, setToasts] = (0, import_react.useState)([]), [cooldown, setCooldown] = (0, import_react.useState)(0), [abilityHud, setAbilityHud] = (0, import_react.useState)({
		surge: 0,
		aegis: 0,
		volley: 0
	});
	const [qualityPreference, setQualityPreference] = (0, import_react.useState)(() => loadQualityPreference());
	const [cameraPanSpeed, setCameraPanSpeed] = (0, import_react.useState)(() => loadCameraPanSpeed());
	const [zoomSensitivity, setZoomSensitivity] = (0, import_react.useState)(() => loadZoomSensitivity());
	const [ritualing, setRitualing] = (0, import_react.useState)(false), [ritualResult, setRitualResult] = (0, import_react.useState)("Der Kessel wartet auf dein erstes Opfer.");
	const [hud, setHud] = (0, import_react.useState)({
		hp: 1250,
		maxHp: 1250,
		shield: 350,
		maxShield: 350,
		gold: 2600,
		pearls: 30,
		level: 1,
		xp: 0,
		kills: 0,
		monsters: 0,
		loot: 0,
		mapId: "aster",
		x: 680,
		y: 900,
		selected: null,
		repairKits: 3,
		materials: 0,
		ammo: { ...freshSave().ammo },
		cannonLevel: 1,
		harpoonLevel: 1,
		shipId: "sovereign",
		ownedShips: ["sovereign"],
		cannonId: "bronze",
		ownedCannons: ["bronze"],
		mojos: 3,
		mapFragments: 0,
		cauldronPity: 0,
		deckLevel: 1,
		progress: {},
		completed: [],
		visited: ["aster"],
		wave: 1
	});
	const saveRef = (0, import_react.useRef)(freshSave()), cameraRef = (0, import_react.useRef)({
		x: 0,
		y: 0,
		zoom: 1
	});
	const gestureRef = (0, import_react.useRef)({
		points: /* @__PURE__ */ new Map(),
		startDistance: 0,
		startZoom: 1,
		pinching: false,
		moved: false,
		down: null
	});
	const toastTimerRef = (0, import_react.useRef)(null), lastToastRef = (0, import_react.useRef)({
		text: "",
		at: 0
	});
	const gameRef = (0, import_react.useRef)(createRuntimeState());
	const toast = (0, import_react.useCallback)((text, kind = "info") => {
		const now = performance.now();
		if (lastToastRef.current.text === text && now - lastToastRef.current.at < 900) return;
		lastToastRef.current = {
			text,
			at: now
		};
		const id = Date.now() + Math.random();
		if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
		setToasts([{
			id,
			text,
			kind
		}]);
		toastTimerRef.current = window.setTimeout(() => setToasts([]), kind === "danger" ? 1700 : 1450);
	}, []);
	const syncSave = (0, import_react.useCallback)(() => {
		const g = gameRef.current, s = saveRef.current;
		Object.assign(s, {
			hp: Math.ceil(g.player.hp),
			maxHp: g.player.maxHp,
			shield: Math.ceil(g.player.shield),
			maxShield: g.player.maxShield,
			mapId: g.mapId,
			ammo: { ...s.ammo },
			visited: [...s.visited]
		});
		writeSave(s).catch(() => void 0);
	}, []);
	const applySave = (0, import_react.useCallback)((raw) => {
		const migrated = migrateSave(raw), base = freshSave(), s = {
			...base,
			...migrated,
			ammo: {
				...base.ammo,
				...migrated.ammo
			},
			shipId: migrated.shipId ?? "sovereign",
			ownedShips: migrated.ownedShips?.length ? migrated.ownedShips : ["sovereign"],
			cannonId: migrated.cannonId ?? "bronze",
			ownedCannons: migrated.ownedCannons?.length ? migrated.ownedCannons : ["bronze"],
			mojos: migrated.mojos ?? 3,
			cauldronPity: migrated.cauldronPity ?? 0,
			mapFragments: migrated.mapFragments ?? 0,
			lastFreeRitual: migrated.lastFreeRitual ?? "",
			deckLevel: clamp(migrated.deckLevel ?? 1, 1, 6),
			hullLevel: clamp(migrated.hullLevel ?? 1, 1, 10),
			sailLevel: clamp(migrated.sailLevel ?? 1, 1, 10),
			crewLevel: clamp(migrated.crewLevel ?? 1, 1, 10),
			talentPoints: Math.max(0, migrated.talentPoints ?? 0)
		};
		const stats = durability(s.shipId, s.deckLevel, s.hullLevel), deck = deckData(s.deckLevel);
		s.maxHp = stats.hp;
		s.maxShield = stats.shield;
		s.hp = clamp(s.hp || stats.hp, 1, stats.hp);
		s.shield = clamp(s.shield ?? stats.shield, 0, stats.shield);
		saveRef.current = s;
		const g = gameRef.current;
		g.mapId = s.mapId;
		g.shipId = s.shipId;
		g.playerName = s.playerName;
		g.playerLevel = s.level;
		g.deckLevel = s.deckLevel;
		g.weaponSlots = deck.weaponSlots;
		g.expansionSlots = deck.expansionSlots;
		g.player = {
			x: 680,
			y: MAPS[s.mapId].height / 2,
			angle: 0,
			hp: s.hp,
			maxHp: stats.hp,
			shield: s.shield,
			maxShield: stats.shield,
			speed: 0
		};
		g.cameraPan = {
			x: 0,
			y: 0
		};
		g.entities = spawnMap(s.mapId);
		g.shots = [];
		g.loot = [];
		setHud((h) => ({
			...h,
			hp: s.hp,
			maxHp: stats.hp,
			shield: s.shield,
			maxShield: stats.shield,
			gold: s.gold,
			pearls: s.pearls,
			level: s.level,
			xp: s.xp,
			mapId: s.mapId,
			repairKits: s.repairKits,
			materials: s.materials,
			ammo: { ...s.ammo },
			cannonLevel: s.cannonLevel,
			harpoonLevel: s.harpoonLevel,
			shipId: s.shipId,
			ownedShips: [...s.ownedShips],
			cannonId: s.cannonId,
			ownedCannons: [...s.ownedCannons],
			mojos: s.mojos,
			mapFragments: s.mapFragments,
			cauldronPity: s.cauldronPity,
			deckLevel: s.deckLevel,
			progress: { ...s.progress },
			completed: [...s.completed],
			visited: [...s.visited]
		}));
	}, []);
	(0, import_react.useEffect)(() => {
		loadSave().then((s) => {
			applySave(s ?? freshSave());
			const settings = saveRef.current.settings;
			if (settings?.cameraPanSpeed) setCameraPanSpeed(settings.cameraPanSpeed);
			if (settings?.zoomSensitivity) setZoomSensitivity(settings.zoomSensitivity);
			setReady(true);
			setAmmo("iron");
			if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("autoStart") === "1") window.setTimeout(() => {
				gameRef.current.running = true;
				gameRef.current.lastTime = performance.now();
				window.__ABYSSAL_GAME__ = gameRef.current;
				setStarted(true);
			}, 300);
		});
	}, [applySave]);
	(0, import_react.useEffect)(() => {
		const handler = (event) => setRuntimeError(event.message);
		window.addEventListener("error", handler);
		return () => window.removeEventListener("error", handler);
	}, []);
	(0, import_react.useEffect)(() => {
		const handler = (event) => setPlayerVisualStatus(event.detail);
		window.addEventListener("abyssal:player-visual-status", handler);
		const existing = window.__ABYSSAL_PLAYER_VISUAL__;
		if (existing) queueMicrotask(() => setPlayerVisualStatus(existing));
		return () => window.removeEventListener("abyssal:player-visual-status", handler);
	}, []);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			if (gameRef.current.running) syncSave();
		}, 1e4);
		return () => window.clearInterval(id);
	}, [syncSave]);
	const bumpProgress = (0, import_react.useCallback)((type, amount = 1) => {
		const s = saveRef.current;
		s.progress[type] = (s.progress[type] || 0) + amount;
		QUESTS.forEach((q) => {
			if (q.type === type && !s.completed.includes(q.id) && s.progress[type] >= q.goal) {
				s.completed.push(q.id);
				grantMissionReward(s, q.id);
				toast(`Mission abgeschlossen: ${q.title}`, "gold");
			}
		});
	}, [toast]);
	const travel = (0, import_react.useCallback)((id) => {
		const s = saveRef.current;
		if (id === "gloam" && s.level < 2) return toast("Dämmersee wird mit Level 2 freigeschaltet", "danger");
		if (id === "coral" && s.level < 3) return toast("Korallenmark wird mit Level 3 freigeschaltet", "danger");
		if (id === "maelstrom" && s.level < 4) return toast("Sturmbruch wird mit Level 4 freigeschaltet", "danger");
		if (id === "abyss" && s.level < 5 && (s.mapFragments ?? 0) < 8) return toast("Level 5 oder acht Kartenfragmente öffnen die Bonuskarte", "danger");
		if (id === "abyss" && s.level < 5) {
			s.mapFragments = Math.max(0, (s.mapFragments ?? 0) - 8);
			toast("Gezeitenkarte zusammengesetzt – Bonusfahrt beginnt!", "gold");
		}
		const g = gameRef.current;
		g.mapId = id;
		g.player.x = 650;
		g.player.y = MAPS[id].height / 2;
		g.player.speed = 0;
		g.cameraPan = {
			x: 0,
			y: 0
		};
		g.destination = null;
		g.navigation = createNavigationState({
			x: g.player.x,
			y: g.player.y
		});
		g.selectedId = null;
		g.entities = spawnMap(id);
		g.shots = [];
		g.loot = [];
		g.wave = 1;
		s.mapId = id;
		if (!s.visited.includes(id)) {
			s.visited.push(id);
			bumpProgress("maps");
		}
		setPanel(null);
		toast(`${MAPS[id].name} betreten`, "gold");
		syncSave();
	}, [
		bumpProgress,
		syncSave,
		toast
	]);
	const fire = (0, import_react.useCallback)(() => {
		const g = gameRef.current, s = saveRef.current, now = performance.now();
		if (!g.running) return;
		const chosen = g.entities.find((e) => e.id === g.selectedId && e.hp > 0);
		if (!chosen) return toast("Wähle zuerst ein Ziel", "danger");
		const monster = monsters.has(chosen.kind);
		let active = ammo;
		if (monster && ammo !== "harpoon") active = "harpoon";
		if (!monster && ammo === "harpoon") active = "iron";
		const a = AMMO[active], broadsideStats = calculateBroadside({
			ammoId: active,
			cannonId: s.cannonId ?? "bronze",
			shipId: s.shipId ?? "sovereign",
			cannonLevel: s.cannonLevel,
			harpoonLevel: s.harpoonLevel,
			crewLevel: s.crewLevel ?? 1,
			deckLevel: s.deckLevel ?? 1,
			targetKind: chosen.kind
		});
		if (now - g.lastShot < broadsideStats.reloadMs) return;
		if (s.ammo[active] <= 0) {
			if (active !== "iron") {
				setAmmo("iron");
				toast(`${a.name} leer – Eisenkugeln gewählt`, "danger");
			}
			return;
		}
		const range = broadsideStats.range, d = distance(g.player, chosen);
		if (d > range) {
			const ang = Math.atan2(chosen.y - g.player.y, chosen.x - g.player.x);
			const planned = planNavigationTo({
				x: chosen.x - Math.cos(ang) * (range - 60),
				y: chosen.y - Math.sin(ang) * (range - 60)
			}, g.player, MAPS[g.mapId].islands);
			g.destination = planned.destination;
			g.navigation = planned.navigation;
			return toast(`Außer Reichweite · ${Math.round(d)} m · Ziel wird angefahren`);
		}
		const ang = Math.atan2(chosen.y - g.player.y, chosen.x - g.player.x), count = broadsideStats.projectileCount, damage = broadsideStats.projectileDamage, side = Math.sin(ang - g.player.angle) >= 0 ? 1 : -1, broadside = g.player.angle + side * Math.PI / 2;
		for (let i = 0; i < count; i++) {
			const spreadIndex = i - (count - 1) / 2, o = spreadIndex * .035, startX = g.player.x + Math.cos(broadside) * 31 + Math.cos(g.player.angle) * spreadIndex * 14, startY = g.player.y + Math.sin(broadside) * 31 + Math.sin(g.player.angle) * spreadIndex * 14;
			g.shots.push({
				x: startX,
				y: startY,
				vx: Math.cos(ang + o) * 570,
				vy: Math.sin(ang + o) * 570,
				ttl: Math.max(1.35, d / 570 + .7),
				enemy: false,
				damage,
				ammo: active,
				targetId: chosen.id
			});
		}
		if (active !== "iron") s.ammo[active]--;
		g.lastShot = now;
	}, [ammo, toast]);
	const updateCameraPanSpeed = (value) => {
		setCameraPanSpeed(value);
		saveCameraPanSpeed(value);
		saveRef.current.settings = {
			...saveRef.current.settings,
			cameraPanSpeed: value
		};
		writeSave(saveRef.current).catch(() => void 0);
	};
	const updateZoomSensitivity = (value) => {
		setZoomSensitivity(value);
		saveZoomSensitivity(value);
		saveRef.current.settings = {
			...saveRef.current.settings,
			zoomSensitivity: value
		};
		writeSave(saveRef.current).catch(() => void 0);
	};
	const selectAmmo = (a) => {
		setAmmo(a);
		toast(`${AMMO[a].name}: ${AMMO[a].effect}`);
	};
	const cycleTarget = () => {
		const g = gameRef.current, alive = g.entities.filter((e) => e.hp > 0).sort((a, b) => distance(a, g.player) - distance(b, g.player));
		if (!alive.length) return toast("Keine Ziele in diesem Gebiet");
		const next = alive[(alive.findIndex((e) => e.id === g.selectedId) + 1) % alive.length];
		g.selectedId = next.id;
		toast(`${ENTITY_DATA[next.kind].name} erfasst`, "gold");
	};
	const repair = () => {
		const s = saveRef.current, g = gameRef.current;
		if (!s.repairKits) return toast("Keine Reparaturkits", "danger");
		if (g.player.hp >= g.player.maxHp) return toast("Rumpf ist bereits intakt");
		s.repairKits--;
		g.player.hp = Math.min(g.player.maxHp, g.player.hp + 450);
		toast("Rumpf um 450 repariert", "gold");
		syncSave();
	};
	const activateAbility = (ability) => {
		const g = gameRef.current, s = saveRef.current, now = performance.now();
		if (!g.running) return;
		if (ability === "surge") {
			if (now < g.surgeReady) return;
			g.surgeUntil = now + 4200 + g.expansionSlots * 70;
			g.surgeReady = now + 15e3;
			toast("Sturmsegel gesetzt: Fahrt stark erhöht", "gold");
			return;
		}
		if (ability === "aegis") {
			if (now < g.aegisReady) return;
			if (g.player.shield >= g.player.maxShield) return toast("Schutzenergie ist bereits voll");
			if (s.pearls < 6) return toast("Benötigt 6 Tiefenperlen", "danger");
			s.pearls -= 6;
			g.player.shield = Math.min(g.player.maxShield, g.player.shield + g.player.maxShield * (.32 + g.expansionSlots * .008));
			g.aegisReady = now + 12e3;
			toast("Reliktschild wiederhergestellt", "gold");
			syncSave();
			return;
		}
		if (now < g.volleyReady) return;
		const target = g.entities.find((e) => e.id === g.selectedId && e.hp > 0);
		if (!target) return toast("Wähle ein Ziel für die Streusalve", "danger");
		if (s.ammo.iron < 4) return toast("Benötigt 4 Eisenkugeln", "danger");
		s.ammo.iron -= 4;
		g.volleyReady = now + 1e4;
		const victims = g.entities.filter((e) => e.hp > 0 && distance(e, target) < 260).slice(0, 5);
		victims.forEach((enemy, i) => {
			const ang = Math.atan2(enemy.y - g.player.y, enemy.x - g.player.x);
			g.shots.push({
				x: g.player.x + Math.cos(g.player.angle) * ((i - 2) * 7),
				y: g.player.y + Math.sin(g.player.angle) * ((i - 2) * 7),
				vx: Math.cos(ang) * 610,
				vy: Math.sin(ang) * 610,
				ttl: 1.35,
				enemy: false,
				damage: 58 * (1 + (s.cannonLevel - 1) * .08),
				ammo: "iron",
				targetId: enemy.id
			});
		});
		toast(`Streusalve auf ${victims.length} Ziele abgefeuert`, "gold");
	};
	const buy = (what) => {
		const s = saveRef.current, g = gameRef.current, cost = purchasePrice(what, s);
		if (s.gold < cost) return toast("Nicht genug Gold", "danger");
		s.gold -= cost;
		if (what === "repair") s.repairKits++;
		if (what === "iron") s.ammo.iron += 80;
		if (what === "piercing") s.ammo.piercing += 25;
		if (what === "cannon") s.cannonLevel++;
		if (what === "harpoon") s.harpoonLevel++;
		if (what === "mojo") s.mojos = (s.mojos ?? 0) + 1;
		if (what === "hull") {
			s.hullLevel = (s.hullLevel ?? 1) + 1;
			const ratio = g.player.hp / Math.max(1, g.player.maxHp), stats = durability(s.shipId ?? "sovereign", s.deckLevel ?? 1, s.hullLevel);
			g.player.maxHp = stats.hp;
			g.player.maxShield = stats.shield;
			g.player.hp = Math.max(1, Math.round(stats.hp * ratio));
			s.hp = g.player.hp;
			s.maxHp = stats.hp;
			s.maxShield = stats.shield;
		}
		if (what === "sails") s.sailLevel = (s.sailLevel ?? 1) + 1;
		if (what === "crew") s.crewLevel = (s.crewLevel ?? 1) + 1;
		bumpProgress("upgrades");
		setHud((h) => ({
			...h,
			gold: s.gold,
			hp: g.player.hp,
			maxHp: g.player.maxHp,
			maxShield: g.player.maxShield,
			cannonLevel: s.cannonLevel,
			harpoonLevel: s.harpoonLevel,
			repairKits: s.repairKits,
			ammo: { ...s.ammo },
			mojos: s.mojos ?? 0
		}));
		toast("Kauf und Einbau abgeschlossen", "gold");
		syncSave();
	};
	const chooseShip = (id) => {
		const s = saveRef.current, g = gameRef.current, ship = SHIPS[id], owned = [...s.ownedShips ?? ["sovereign"]];
		if (!owned.includes(id)) {
			if (s.gold < ship.price) return toast(`Es fehlen ${(ship.price - s.gold).toLocaleString("de-DE")} Gold`, "danger");
			s.gold -= ship.price;
			owned.push(id);
			s.ownedShips = owned;
			bumpProgress("ships-owned");
			toast(`${ship.name} wurde deiner Flotte hinzugefügt`, "gold");
		}
		const hpRatio = g.player.hp / Math.max(1, g.player.maxHp), shieldRatio = g.player.shield / Math.max(1, g.player.maxShield), stats = durability(id, s.deckLevel ?? 1, s.hullLevel);
		s.shipId = id;
		g.shipId = id;
		g.player.maxHp = stats.hp;
		g.player.maxShield = stats.shield;
		g.player.hp = Math.max(1, Math.round(stats.hp * hpRatio));
		g.player.shield = Math.round(stats.shield * shieldRatio);
		s.maxHp = stats.hp;
		s.maxShield = stats.shield;
		s.hp = g.player.hp;
		s.shield = g.player.shield;
		setHud((h) => ({
			...h,
			shipId: id,
			ownedShips: owned,
			gold: s.gold,
			hp: g.player.hp,
			maxHp: stats.hp,
			shield: g.player.shield,
			maxShield: stats.shield
		}));
		toast(`${ship.name} ist ausgerüstet und auf der Karte aktiv`, "gold");
		syncSave();
	};
	const chooseCannon = (id) => {
		const s = saveRef.current, cannon = CANNONS[id], owned = [...s.ownedCannons ?? ["bronze"]];
		if (!owned.includes(id)) {
			if (s.gold < cannon.price) return toast(`Es fehlen ${(cannon.price - s.gold).toLocaleString("de-DE")} Gold`, "danger");
			s.gold -= cannon.price;
			owned.push(id);
			s.ownedCannons = owned;
			toast(`${cannon.name} gekauft`, "gold");
		}
		s.cannonId = id;
		setHud((h) => ({
			...h,
			cannonId: id,
			ownedCannons: owned,
			gold: s.gold
		}));
		toast(`${cannon.name} ausgerüstet`, "gold");
		syncSave();
	};
	const upgradeDeck = () => {
		const s = saveRef.current, g = gameRef.current, current = clamp(s.deckLevel ?? 1, 1, 6);
		if (current >= 6) return toast("Das Dominion-Deck ist bereits vollständig ausgebaut", "gold");
		const next = current + 1, deck = deckData(next);
		if (s.gold < deck.cost) return toast(`Es fehlen ${(deck.cost - s.gold).toLocaleString("de-DE")} Gold`, "danger");
		s.gold -= deck.cost;
		s.deckLevel = next;
		g.deckLevel = next;
		g.weaponSlots = deck.weaponSlots;
		g.expansionSlots = deck.expansionSlots;
		const hpRatio = g.player.hp / Math.max(1, g.player.maxHp), shieldRatio = g.player.shield / Math.max(1, g.player.maxShield), stats = durability(s.shipId ?? "sovereign", next, s.hullLevel);
		g.player.maxHp = stats.hp;
		g.player.maxShield = stats.shield;
		g.player.hp = Math.max(1, Math.round(stats.hp * hpRatio));
		g.player.shield = Math.round(stats.shield * shieldRatio);
		s.hp = g.player.hp;
		s.maxHp = stats.hp;
		s.shield = g.player.shield;
		s.maxShield = stats.shield;
		bumpProgress("upgrades");
		setHud((h) => ({
			...h,
			deckLevel: next,
			gold: s.gold,
			hp: g.player.hp,
			maxHp: stats.hp,
			shield: g.player.shield,
			maxShield: stats.shield
		}));
		toast(`${deck.name} eingebaut: ${deck.weaponSlots} Waffenplätze`, "gold");
		syncSave();
	};
	const performRitual = () => {
		if (ritualing) return;
		const s = saveRef.current, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), free = s.lastFreeRitual !== today;
		if (!free && (s.mojos ?? 0) < 1) return toast("Du brauchst ein Gezeiten-Mojo", "danger");
		if (free) s.lastFreeRitual = today;
		else s.mojos = (s.mojos ?? 0) - 1;
		setRitualing(true);
		setRitualResult("Die Strömungen sammeln sich …");
		window.setTimeout(() => {
			const pity = s.cauldronPity ?? 0, roll = pity >= 8 ? .995 : Math.random();
			let result = "";
			if (roll < .29) {
				s.gold += 900;
				result = "900 Gold";
			} else if (roll < .49) {
				s.ammo.piercing += 35;
				result = "35 Panzerbrecher";
			} else if (roll < .66) {
				s.materials += 3;
				result = "3 Reliktfragmente";
			} else if (roll < .79) {
				s.pearls += 18;
				result = "18 Tiefenperlen";
			} else if (roll < .9) {
				s.repairKits += 2;
				result = "2 Reparaturkits";
			} else {
				s.mapFragments = (s.mapFragments ?? 0) + 1;
				s.cauldronPity = 0;
				result = "1 Fragment der Gezeitenkarte";
			}
			if (roll < .9) s.cauldronPity = pity + 1;
			bumpProgress("rituals");
			setRitualResult(result);
			setRitualing(false);
			toast(`Ritualbelohnung: ${result}`, "gold");
			syncSave();
		}, 1150);
	};
	const respawn = () => {
		const g = gameRef.current, s = saveRef.current;
		g.mapId = "aster";
		s.mapId = "aster";
		g.player.hp = g.player.maxHp * .7;
		g.player.shield = g.player.maxShield;
		g.player.x = 650;
		g.player.y = MAPS.aster.height / 2;
		g.player.speed = 0;
		g.destination = null;
		g.navigation = createNavigationState({
			x: g.player.x,
			y: g.player.y
		});
		g.cameraPan = {
			x: 0,
			y: 0
		};
		g.entities = spawnMap("aster");
		g.shots = [];
		g.loot = [];
		g.selectedId = null;
		g.running = true;
		g.lastTime = performance.now();
		setDeath(null);
		toast("Im sicheren Hafen geborgen · Schutz aktiv", "gold");
		syncSave();
	};
	const enterImmersiveMode = async () => {
		try {
			if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
			await screen.orientation.lock?.("landscape");
		} catch {}
	};
	const start = () => {
		enterImmersiveMode();
		gameRef.current.running = true;
		gameRef.current.lastTime = performance.now();
		setStarted(true);
		if (typeof window !== "undefined") window.__ABYSSAL_GAME__ = gameRef.current;
		toast("Tippe auf das Meer oder nutze WASD zum Segeln", "gold");
	};
	const exportSave = () => {
		syncSave();
		const blob = new Blob([JSON.stringify(saveRef.current, null, 2)], { type: "application/json" }), a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "abyssal-dominion-save.json";
		a.click();
		URL.revokeObjectURL(a.href);
	};
	const importSave = (e) => {
		const f = e.target.files?.[0];
		if (!f) return;
		f.text().then((t) => {
			try {
				const s = JSON.parse(t);
				if (!s.version || s.version < 2 || s.version > 4) throw Error();
				applySave(s);
				writeSave(saveRef.current);
				toast("Spielstand importiert und auf V4 migriert", "gold");
				setPanel(null);
			} catch {
				toast("Ungültiger Spielstand", "danger");
			}
		});
	};
	(0, import_react.useEffect)(() => {
		const runAction = (action) => {
			const g = gameRef.current;
			if (action === "primaryFire" || action === "harpoonFire") fire();
			if (action === "cycleTarget") {
				const alive = g.entities.filter((x) => x.hp > 0);
				g.selectedId = alive[(Math.max(0, alive.findIndex((x) => x.id === g.selectedId)) + 1) % alive.length]?.id ?? null;
			}
			if (action === "cancelNavigation") {
				g.destination = null;
				g.navigation.ultimateDestination = null;
				g.navigation.detourWaypoint = null;
			}
			if (action === "closePanel") setPanel(null);
			if (action === "ability1") activateAbility("surge");
			if (action === "ability2") activateAbility("volley");
			if (action === "ability3") activateAbility("aegis");
			if (action === "openMap") setPanel("map");
			if (action === "openShipyard") setPanel("shipyard");
			if (action === "zoomIn") g.zoom = clamp(g.zoom + .08, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom);
			if (action === "zoomOut") g.zoom = clamp(g.zoom - .08, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom);
		};
		const down = (e) => {
			const action = resolveKeyboardAction(e);
			if (!action) return;
			if (action === "primaryFire" || action === "cycleTarget" || action === "closePanel") e.preventDefault();
			if (CONTINUOUS_ACTIONS.has(action)) gameRef.current.actions.add(action);
			else if (!e.repeat) runAction(action);
		};
		const up = (e) => {
			const action = resolveKeyboardAction(e);
			if (action) gameRef.current.actions.delete(action);
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
		};
	}, [fire]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let raf = 0, hudTick = 0;
		const water = (w, h, t, mapId) => {
			const m = MAPS[mapId], grad = ctx.createLinearGradient(0, 0, 0, h);
			grad.addColorStop(0, m.color[0]);
			grad.addColorStop(1, m.color[1]);
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, w, h);
			ctx.strokeStyle = "rgba(170,235,238,.12)";
			ctx.lineWidth = 1;
			for (let y = 20; y < h + 30; y += 50) for (let x = 0; x < w + 70; x += 76) {
				ctx.beginPath();
				ctx.arc(x + Math.sin((y + t * 28) / 90) * 15, y + Math.sin((x + t * 18) / 115) * 5, 15, 3.6, 5.8);
				ctx.stroke();
			}
			if (m.weather !== "clear") {
				ctx.strokeStyle = m.weather === "storm" ? "rgba(190,225,242,.24)" : "rgba(170,220,235,.14)";
				for (let i = 0; i < (m.weather === "storm" ? 90 : 45); i++) {
					const x = (i * 83 + t * 360) % w, y = (i * 47 + t * 520) % h;
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x - 9, y + 19);
					ctx.stroke();
				}
			}
		};
		const island = (it, camX, camY, z) => {
			const x = (it.x - camX) * z, y = (it.y - camY) * z;
			ctx.save();
			ctx.translate(x, y);
			ctx.scale(z, z);
			ctx.fillStyle = "rgba(0,12,18,.38)";
			ctx.beginPath();
			ctx.ellipse(9, 15, it.rx * 1.08, it.ry * 1.12, -.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#c7a95f";
			ctx.beginPath();
			ctx.ellipse(0, 0, it.rx, it.ry, -.1, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = it.port ? "#54783e" : "#426b3e";
			ctx.beginPath();
			ctx.ellipse(-8, -7, it.rx * .8, it.ry * .7, -.1, 0, Math.PI * 2);
			ctx.fill();
			for (let i = 0; i < 8; i++) {
				ctx.fillStyle = i % 2 ? "#274d38" : "#355c39";
				ctx.beginPath();
				ctx.arc(Math.cos(i * 2.3) * it.rx * .48, Math.sin(i * 1.9) * it.ry * .42, 9 + i % 3 * 3, 0, Math.PI * 2);
				ctx.fill();
			}
			if (it.port) {
				ctx.fillStyle = "#d4c39a";
				ctx.fillRect(-18, -50, 40, 36);
				ctx.fillStyle = "#9b3f31";
				ctx.beginPath();
				ctx.moveTo(-27, -50);
				ctx.lineTo(31, -50);
				ctx.lineTo(2, -74);
				ctx.fill();
				ctx.fillStyle = "#744827";
				ctx.fillRect(32, -10, 62, 14);
			}
			ctx.restore();
			ctx.fillStyle = "rgba(4,14,19,.82)";
			ctx.font = "600 11px system-ui";
			ctx.textAlign = "center";
			ctx.fillText(it.name, x, y + (it.ry + 25) * z);
		};
		const ship = (e, camX, camY, z, player = false) => {
			const x = (e.x - camX) * z, y = (e.y - camY) * z, isEntity = "kind" in e, kind = isEntity ? e.kind : "raider", d = ENTITY_DATA[kind], monster = isEntity && monsters.has(kind);
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(e.angle);
			ctx.scale(z, z);
			if (monster) {
				ctx.fillStyle = kind === "serpent" ? "#3d9a7a" : kind === "leviathan" ? "#355268" : "#653d83";
				for (let i = 0; i < (kind === "kraken" ? 7 : 4); i++) {
					ctx.strokeStyle = ctx.fillStyle;
					ctx.lineWidth = 8;
					ctx.beginPath();
					ctx.moveTo(-8, 0);
					ctx.quadraticCurveTo(-35 - i * 5, (i - 3) * 13, -65 - i * 4, (i - 3) * 18);
					ctx.stroke();
				}
				ctx.beginPath();
				ctx.ellipse(12, 0, d.boss ? 48 : 38, d.boss ? 32 : 25, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = "#76e5df";
				ctx.beginPath();
				ctx.arc(25, -8, 5, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.fillStyle = "rgba(0,8,14,.35)";
				ctx.beginPath();
				ctx.ellipse(-5, 10, d.boss ? 54 : 43, d.boss ? 21 : 16, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = player ? "#b97932" : d.boss ? "#6d2934" : kind === "ghost" ? "#315c62" : "#4b2a22";
				ctx.beginPath();
				ctx.moveTo(d.boss ? 60 : 50, 0);
				ctx.lineTo(27, 17);
				ctx.lineTo(-42, 17);
				ctx.lineTo(-50, 0);
				ctx.lineTo(-42, -17);
				ctx.lineTo(27, -17);
				ctx.closePath();
				ctx.fill();
				ctx.strokeStyle = player ? "#ffe19a" : "#c07a52";
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.strokeStyle = "#d8c49b";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(2, -3);
				ctx.lineTo(2, -54);
				ctx.stroke();
				ctx.fillStyle = player ? "#ece3cc" : kind === "ghost" ? "rgba(125,239,226,.7)" : "#17191b";
				ctx.beginPath();
				ctx.moveTo(4, -51);
				ctx.lineTo(4, -7);
				ctx.lineTo(39, -19);
				ctx.closePath();
				ctx.fill();
			}
			if (isEntity && e.hitAt > performance.now() - 120) {
				ctx.fillStyle = "rgba(255,225,155,.65)";
				ctx.beginPath();
				ctx.arc(0, 0, 48, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
			if (isEntity) {
				if (gameRef.current.selectedId === e.id) {
					ctx.strokeStyle = "#f3cd68";
					ctx.lineWidth = 2;
					ctx.setLineDash([7, 5]);
					ctx.beginPath();
					ctx.ellipse(x, y, 58 * z, 37 * z, 0, 0, Math.PI * 2);
					ctx.stroke();
					ctx.setLineDash([]);
				}
				const bw = d.boss ? 100 : 76;
				ctx.fillStyle = "rgba(3,12,18,.85)";
				ctx.fillRect(x - bw / 2, y - 66 * z, bw, 7);
				ctx.fillStyle = e.hp / e.maxHp > .45 ? "#d5574d" : "#ff983f";
				ctx.fillRect(x - bw / 2 + 1, y - 65 * z, (bw - 2) * Math.max(0, e.hp / e.maxHp), 5);
				ctx.fillStyle = "#f6e9d2";
				ctx.font = `${d.boss ? 700 : 600} 10px system-ui`;
				ctx.textAlign = "center";
				ctx.fillText(`${monster ? "MONSTER" : "KI"} · ${d.name}`, x, y - 73 * z);
			}
		};
		const render = (ts) => {
			const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
			if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
				canvas.width = Math.round(rect.width * dpr);
				canvas.height = Math.round(rect.height * dpr);
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const w = rect.width, h = rect.height, g = gameRef.current, m = MAPS[g.mapId], dt = Math.min((ts - (g.lastTime || ts)) / 1e3, .033);
			g.lastTime = ts;
			if (g.running) try {
				const shipStats = SHIPS[saveRef.current.shipId ?? "sovereign"], sailBonus = 1 + Math.max(0, (saveRef.current.sailLevel ?? 1) - 1) * .055;
				let turn = 0, thrust = 0;
				if (g.actions.has("steerLeft")) turn = -1;
				if (g.actions.has("steerRight")) turn = 1;
				if (g.actions.has("moveForward")) thrust = 1;
				if (g.actions.has("moveBackward")) thrust = -.5;
				if (Math.hypot(g.joystick.x, g.joystick.y) > .08) {
					const panSpeed = resolveCameraPanSpeed(cameraPanSpeed) / Math.max(.65, g.zoom);
					const nextPanX = g.cameraPan.x + g.joystick.x * panSpeed * dt, nextPanY = g.cameraPan.y + g.joystick.y * panSpeed * dt;
					g.cameraPan.x = clamp(nextPanX, 320 - g.player.x, m.width - 320 - g.player.x);
					g.cameraPan.y = clamp(nextPanY, 230 - g.player.y, m.height - 230 - g.player.y);
				}
				const movement = stepShipMovement({
					dt,
					player: g.player,
					destination: g.destination,
					navigation: g.navigation,
					islands: m.islands,
					mapWidth: m.width,
					mapHeight: m.height,
					shipTurnRate: shipStats.turn,
					shipMaxSpeed: shipStats.speed,
					sailBonus,
					surgeMultiplier: g.surgeUntil > ts ? 1.55 : 1,
					keyboardTurn: turn,
					keyboardThrust: thrust
				});
				g.player.x = movement.player.x;
				g.player.y = movement.player.y;
				g.player.angle = movement.player.angle;
				g.player.speed = movement.player.speed;
				g.destination = movement.destination;
				g.navigation = movement.navigation;
				g.movementDebug = movement.movementDebug ?? null;
				if (Math.abs(g.player.speed) > 40 && Math.random() < clamp(Math.abs(g.player.speed) / 520, .07, .24)) {
					const wakeOffset = PLAYER_SHIP_VISUALS[g.shipId]?.wakeOffset ?? {
						forward: -43,
						lateral: 0
					}, wakeOrigin = worldOffset(g.player, g.player.angle, wakeOffset);
					g.wake.push({
						x: wakeOrigin.x,
						y: wakeOrigin.y,
						ttl: .92,
						angle: g.player.angle,
						strength: clamp(Math.abs(g.player.speed) / shipStats.speed, .14, .82)
					});
					if (g.wake.length > 14) g.wake = g.wake.slice(-14);
				}
				if (g.autoFire) fire();
				g.entities.forEach((e) => {
					if (e.hp <= 0) return;
					const d = ENTITY_DATA[e.kind], range = distance(e, g.player), a = Math.atan2(g.player.y - e.y, g.player.x - e.x), slow = e.statusUntil > ts ? .55 : 1;
					if (range < 720) {
						const ideal = monsters.has(e.kind) ? 240 : 330;
						e.angle += clamp(normalizeAngle(a - e.angle), -1, 1) * .68 * dt;
						if (range > ideal) {
							e.x += Math.cos(e.angle) * d.speed * slow * dt;
							e.y += Math.sin(e.angle) * d.speed * slow * dt;
						} else if (e.kind === "scout") {
							e.x -= Math.cos(e.angle) * d.speed * .5 * dt;
							e.y -= Math.sin(e.angle) * d.speed * .5 * dt;
						}
					} else e.angle += Math.sin(ts / 1700 + e.id) * .12 * dt;
					if (range < d.range && ts - e.fireAt > 1700 + e.id % 5 * 170) {
						e.fireAt = ts;
						const burst = d.boss ? 2 : 1;
						for (let i = 0; i < burst; i++) g.shots.push({
							x: e.x,
							y: e.y,
							vx: Math.cos(a + (i ? .035 : -.01)) * 390,
							vy: Math.sin(a + (i ? .035 : -.01)) * 390,
							ttl: Math.max(1.45, range / 390 + .65),
							enemy: true,
							damage: d.damage,
							ammo: monsters.has(e.kind) ? "harpoon" : "iron"
						});
					}
				});
				g.shots.forEach((s) => {
					const intended = s.enemy ? g.player : s.targetId !== void 0 ? g.entities.find((e) => e.id === s.targetId && e.hp > 0) : void 0;
					if (intended) {
						const speed = Math.max(1, Math.hypot(s.vx, s.vy)), aim = Math.atan2(intended.y - s.y, intended.x - s.x), desiredVx = Math.cos(aim) * speed, desiredVy = Math.sin(aim) * speed, guidance = Math.min(1, dt * (s.enemy ? 4.5 : 10));
						s.vx += (desiredVx - s.vx) * guidance;
						s.vy += (desiredVy - s.vy) * guidance;
					}
					s.x += s.vx * dt;
					s.y += s.vy * dt;
					s.ttl -= dt;
					if (s.enemy) {
						if (distance(s, g.player) < 44) {
							let dmg = s.damage;
							if (g.player.shield > 0) {
								const absorbed = Math.min(g.player.shield, dmg * .65);
								g.player.shield -= absorbed;
								dmg -= absorbed;
							}
							g.player.hp -= dmg;
							g.lastHit = ts;
							s.hit = true;
							s.ttl = 0;
						}
					} else {
						const hit = s.targetId !== void 0 ? g.entities.find((e) => e.id === s.targetId && e.hp > 0 && distance(s, e) < (monsters.has(e.kind) ? 58 : 48)) : g.entities.find((e) => e.hp > 0 && distance(s, e) < (monsters.has(e.kind) ? 58 : 48));
						if (hit) {
							let damage = s.damage;
							if (s.ammo === "harpoon" && !monsters.has(hit.kind)) damage *= .15;
							if (s.ammo !== "harpoon" && monsters.has(hit.kind)) damage *= .35;
							if (s.ammo === "fire") damage += 18;
							if (s.ammo === "frost") hit.statusUntil = ts + 2200;
							hit.hp -= damage;
							hit.hitAt = ts;
							s.hit = true;
							s.ttl = 0;
							if (hit.hp <= 0) {
								const d = ENTITY_DATA[hit.kind], isMonster = monsters.has(hit.kind);
								g.kills++;
								if (isMonster) g.monsterKills++;
								const elite = hit.kind === "elite" || hit.kind === "boss";
								g.loot.push({
									id: hit.id,
									x: hit.x,
									y: hit.y,
									gold: d.reward,
									pearls: elite ? 35 : isMonster ? 12 : 0,
									materials: elite ? 3 : 1,
									born: ts
								});
								saveRef.current.xp += d.level * 55;
								bumpProgress(isMonster ? "monsters" : "ships");
								if (elite) bumpProgress("elite");
								toast(`${d.name} besiegt!`, "gold");
								g.selectedId = null;
							}
						}
					}
				});
				g.shots = g.shots.filter((s) => s.ttl > 0);
				g.wake.forEach((x) => x.ttl -= dt);
				g.wake = g.wake.filter((x) => x.ttl > 0);
				g.loot.forEach((l) => {
					if (distance(l, g.player) < 78) {
						const s = saveRef.current;
						s.gold += l.gold;
						s.pearls += l.pearls;
						s.materials += l.materials;
						g.lootCount++;
						l.born = -1;
						bumpProgress("loot");
						toast(`+${l.gold} Gold${l.pearls ? ` · +${l.pearls} Perlen` : ""}`, "gold");
					}
				});
				g.loot = g.loot.filter((l) => l.born !== -1);
				if (ts - g.lastHit > 6e3) g.player.shield = Math.min(g.player.maxShield, g.player.shield + 28 * dt);
				const s = saveRef.current;
				while (s.xp >= s.level * 600) {
					s.xp -= s.level * 600;
					s.level++;
					g.playerLevel = s.level;
					g.player.hp = g.player.maxHp;
					g.player.shield = g.player.maxShield;
					toast(`Level ${s.level} erreicht!`, "gold");
				}
				if (g.mapId === "abyss" && g.entities.every((e) => e.hp <= 0)) {
					if (g.wave < 3) {
						g.wave++;
						g.entities = spawnMap("abyss", g.wave === 3);
						toast(`Welle ${g.wave} beginnt`, "danger");
					}
				}
				if (g.player.hp <= 0) {
					g.running = false;
					setDeath("Dein Schiff wurde von den Mächten der Tiefe versenkt.");
					syncSave();
				}
				if (ts - hudTick > 200) {
					hudTick = ts;
					const target = g.entities.find((e) => e.id === g.selectedId && e.hp > 0), td = target ? ENTITY_DATA[target.kind] : null, cannon = CANNONS[s.cannonId ?? "bronze"];
					setCooldown(Math.max(0, 1 - (ts - g.lastShot) / (AMMO[ammo].reload * cannon.reload * 1e3)));
					setAbilityHud({
						surge: Math.max(0, (g.surgeReady - ts) / 1e3),
						aegis: Math.max(0, (g.aegisReady - ts) / 1e3),
						volley: Math.max(0, (g.volleyReady - ts) / 1e3)
					});
					setHud({
						hp: Math.ceil(g.player.hp),
						maxHp: g.player.maxHp,
						shield: Math.ceil(g.player.shield),
						maxShield: g.player.maxShield,
						gold: s.gold,
						pearls: s.pearls,
						level: s.level,
						xp: s.xp,
						kills: g.kills,
						monsters: g.monsterKills,
						loot: g.lootCount,
						mapId: g.mapId,
						x: g.player.x,
						y: g.player.y,
						selected: target && td ? {
							name: td.name,
							level: td.level,
							hp: Math.max(0, Math.ceil(target.hp)),
							maxHp: target.maxHp,
							range: Math.ceil(distance(g.player, target)),
							kind: target.kind
						} : null,
						repairKits: s.repairKits,
						materials: s.materials,
						ammo: { ...s.ammo },
						cannonLevel: s.cannonLevel,
						harpoonLevel: s.harpoonLevel,
						shipId: s.shipId ?? "sovereign",
						ownedShips: [...s.ownedShips ?? ["sovereign"]],
						cannonId: s.cannonId ?? "bronze",
						ownedCannons: [...s.ownedCannons ?? ["bronze"]],
						mojos: s.mojos ?? 0,
						mapFragments: s.mapFragments ?? 0,
						cauldronPity: s.cauldronPity ?? 0,
						deckLevel: s.deckLevel ?? 1,
						progress: { ...s.progress },
						completed: [...s.completed],
						visited: [...s.visited],
						wave: g.wave
					});
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				console.error("abyssal-game-loop", message);
				setRuntimeError(message);
				g.running = false;
			}
			const z = g.zoom, viewW = w / z, viewH = h / z, camX = clamp(g.player.x + g.cameraPan.x - viewW / 2, 0, Math.max(0, m.width - viewW)), camY = clamp(g.player.y + g.cameraPan.y - viewH / 2, 0, Math.max(0, m.height - viewH));
			cameraRef.current = {
				x: camX,
				y: camY,
				zoom: z
			};
			water(w, h, ts / 1e3, g.mapId);
			m.islands.forEach((i) => island(i, camX, camY, z));
			g.wake.forEach((p) => {
				ctx.strokeStyle = `rgba(205,245,244,${p.ttl * .3})`;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc((p.x - camX) * z, (p.y - camY) * z, (18 * (1.2 - p.ttl) + 7) * z, 0, Math.PI * 2);
				ctx.stroke();
			});
			g.loot.forEach((l) => {
				const x = (l.x - camX) * z, y = (l.y - camY) * z, bob = Math.sin(ts / 220) * 4;
				ctx.fillStyle = "rgba(245,196,72,.2)";
				ctx.beginPath();
				ctx.arc(x, y, 28 * z, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = "#e7b943";
				ctx.fillRect(x - 11 * z, y + (-9 + bob) * z, 22 * z, 18 * z);
			});
			g.entities.filter((e) => e.hp > 0).forEach((e) => ship(e, camX, camY, z));
			ship(g.player, camX, camY, z, true);
			g.shots.forEach((s) => {
				const x = (s.x - camX) * z, y = (s.y - camY) * z;
				ctx.fillStyle = s.enemy ? "#ff7659" : AMMO[s.ammo].color;
				ctx.beginPath();
				ctx.arc(x, y, (s.ammo === "harpoon" ? 6 : 4) * z, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = s.enemy ? "rgba(255,100,70,.3)" : AMMO[s.ammo].color;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x - s.vx * .035 * z, y - s.vy * .035 * z);
				ctx.stroke();
			});
			if (g.destination) {
				ctx.strokeStyle = "#f2d174";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc((g.destination.x - camX) * z, (g.destination.y - camY) * z, 13 + Math.sin(ts / 180) * 3, 0, Math.PI * 2);
				ctx.stroke();
			}
			raf = requestAnimationFrame(render);
		};
		raf = requestAnimationFrame(render);
		return () => cancelAnimationFrame(raf);
	}, [
		ammo,
		bumpProgress,
		fire,
		syncSave,
		toast
	]);
	(0, import_react.useEffect)(() => {
		const canvas = threeCanvasRef.current;
		if (!canvas || !ready) return;
		let renderer = null, raf = 0, disposed = false;
		import("./threeRenderer-D5acvNWe.js").then(({ AbyssalThreeRenderer }) => {
			if (disposed) return;
			renderer = new AbyssalThreeRenderer(canvas, qualityPreference);
			renderer3DRef.current = renderer;
			const draw = (time) => {
				if (disposed || !renderer) return;
				renderer.render(gameRef.current, time);
				raf = requestAnimationFrame(draw);
			};
			raf = requestAnimationFrame(draw);
		}).catch((error) => {
			if (disposed) return;
			console.error("abyssal-3d-renderer", error);
			setRuntimeError("Der 3D-Renderer konnte nicht geladen werden.");
		});
		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			renderer?.dispose();
			renderer3DRef.current = null;
		};
	}, [qualityPreference, ready]);
	const handleWorldTap = (clientX, clientY) => {
		if (!started || panel || death) return;
		const renderer = renderer3DRef.current, g = gameRef.current;
		if (!renderer) return;
		const entityId = renderer.pickEntity(clientX, clientY);
		if (entityId !== null) {
			const hit = g.entities.find((x) => x.id === entityId && x.hp > 0);
			if (hit) {
				g.selectedId = hit.id;
				toast(`${ENTITY_DATA[hit.kind].name} erfasst`, "gold");
				return;
			}
		}
		const point = renderer.pointFromEvent(clientX, clientY);
		if (point) {
			const planned = planNavigationTo({
				x: clamp(point.x, 40, MAPS[g.mapId].width - 40),
				y: clamp(point.y, 40, MAPS[g.mapId].height - 40)
			}, g.player, MAPS[g.mapId].islands);
			g.destination = planned.destination;
			g.navigation = planned.navigation;
		}
	};
	const recenterCamera = () => {
		gameRef.current.cameraPan = {
			x: 0,
			y: 0
		};
	};
	const adjustZoom = (delta) => {
		gameRef.current.zoom = clamp(gameRef.current.zoom + delta, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom);
	};
	const onCanvasDown = (e) => {
		if (!started || panel || death) return;
		const gesture = gestureRef.current;
		gesture.points.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		gesture.down = gesture.points.size === 1 ? {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY
		} : null;
		gesture.moved = false;
		e.currentTarget.setPointerCapture(e.pointerId);
		if (gesture.points.size === 2) {
			const points = [...gesture.points.values()];
			gesture.startDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
			gesture.startZoom = gameRef.current.zoom;
			gesture.pinching = true;
		}
	};
	const onCanvasMove = (e) => {
		const gesture = gestureRef.current;
		if (!gesture.points.has(e.pointerId)) return;
		gesture.points.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (gesture.down && Math.hypot(e.clientX - gesture.down.x, e.clientY - gesture.down.y) > 8) gesture.moved = true;
		if (gesture.points.size >= 2) {
			const points = [...gesture.points.values()], distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
			if (gesture.startDistance > 0) {
				const sens = resolveZoomSensitivity(zoomSensitivity);
				const ratio = distance / gesture.startDistance;
				gameRef.current.zoom = clamp(gesture.startZoom * Math.pow(ratio, sens), GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom);
			}
			gesture.pinching = true;
			e.preventDefault();
		}
	};
	const onCanvasUp = (e) => {
		const gesture = gestureRef.current, wasPinching = gesture.pinching, down = gesture.down;
		gesture.points.delete(e.pointerId);
		if (!wasPinching && !gesture.moved && down?.id === e.pointerId) handleWorldTap(e.clientX, e.clientY);
		if (gesture.points.size < 2) {
			gesture.startDistance = 0;
			if (gesture.points.size === 0) {
				gesture.pinching = false;
				gesture.down = null;
				gesture.moved = false;
			}
		}
	};
	const onCanvasCancel = (e) => {
		const gesture = gestureRef.current;
		gesture.points.delete(e.pointerId);
		if (gesture.points.size === 0) {
			gesture.pinching = false;
			gesture.down = null;
			gesture.moved = false;
			gesture.startDistance = 0;
		}
	};
	const onWheel = (e) => {
		e.preventDefault();
		const sens = resolveZoomSensitivity(zoomSensitivity);
		gameRef.current.zoom = clamp(gameRef.current.zoom - e.deltaY * 7e-4 * sens, GAMEPLAY_CAMERA_POLICY.minZoom, GAMEPLAY_CAMERA_POLICY.maxZoom);
	};
	const joystickMove = (e) => {
		const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left - r.width / 2) / (r.width * .36), y = (e.clientY - r.top - r.height / 2) / (r.height * .36), magnitude = Math.hypot(x, y), n = Math.max(1, magnitude), value = magnitude < .12 ? {
			x: 0,
			y: 0
		} : {
			x: x / n,
			y: y / n
		};
		gameRef.current.joystick = value;
		const knob = e.currentTarget.querySelector("i");
		if (knob) knob.style.transform = `translate(${value.x * 24}px, ${value.y * 24}px)`;
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const joystickEnd = (e) => {
		gameRef.current.joystick = {
			x: 0,
			y: 0
		};
		const knob = e.currentTarget.querySelector("i");
		if (knob) knob.style.transform = "translate(0, 0)";
	};
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "loading",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚓" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "ABYSSAL DOMINION" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Seekarten werden geladen …" })
		]
	});
	const map = MAPS[hud.mapId], activeQuest = QUESTS.find((q) => !hud.completed.includes(q.id)) ?? QUESTS[0], questProgress = Math.min(activeQuest.goal, hud.progress[activeQuest.type] || 0), activeMonster = !!hud.selected && monsters.has(hud.selected.kind), currentDeck = deckData(hud.deckLevel), nextDeck = deckData(Math.min(6, hud.deckLevel + 1));
	const combatAmmo = activeMonster ? "harpoon" : ammo === "harpoon" ? "iron" : ammo;
	const combatRange = hud.selected ? calculateBroadside({
		ammoId: combatAmmo,
		cannonId: saveRef.current.cannonId ?? "bronze",
		shipId: saveRef.current.shipId ?? "sovereign",
		cannonLevel: saveRef.current.cannonLevel,
		harpoonLevel: saveRef.current.harpoonLevel,
		crewLevel: saveRef.current.crewLevel ?? 1,
		deckLevel: saveRef.current.deckLevel ?? 1,
		targetKind: hud.selected.kind
	}).range : 0;
	const targetInRange = !!hud.selected && hud.selected.range <= combatRange;
	const showShipVisualDebug = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && new URLSearchParams(window.location.search).get("shipDebug") === "1";
	const showVisualBuildDebug = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && new URLSearchParams(window.location.search).get("visualDebug") === "1";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "game-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "logic-canvas",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: threeCanvasRef,
				className: "world world-3d",
				onPointerDown: onCanvasDown,
				onPointerMove: onCanvasMove,
				onPointerUp: onCanvasUp,
				onPointerCancel: onCanvasCancel,
				onWheel,
				"aria-label": "3D-Spielwelt von Abyssal Dominion"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sunwash" }),
			runtimeError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "runtime-error",
				children: runtimeError
			}),
			showVisualBuildDebug && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "visual-build-debug",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["BUILD: ", "V20.3.2"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["COMMIT: ", "d6c4de5"] })]
			}),
			showShipVisualDebug && playerVisualStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `player-visual-device-status ${playerVisualStatus.status}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: playerVisualStatus.status === "kraken-attached" ? "KRAKEN AKTIV" : playerVisualStatus.status === "loading" ? "KRAKEN WIRD GELADEN" : playerVisualStatus.status === "kraken-failed" ? "KRAKEN-LADEFEHLER" : "PLAYER-FALLBACK" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						"Ship: ",
						playerVisualStatus.activeShipId,
						" · Meshes: ",
						playerVisualStatus.meshCount,
						" · Fallback: ",
						playerVisualStatus.fallbackPresent ? "JA" : "NEIN"
					] }),
					playerVisualStatus.visualBoundsCenter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						"Player X/Z: ",
						Math.round(playerVisualStatus.playerWorldPosition.x),
						"/",
						Math.round(playerVisualStatus.playerWorldPosition.z),
						" · Mesh X/Z: ",
						Math.round(playerVisualStatus.visualBoundsCenter.x),
						"/",
						Math.round(playerVisualStatus.visualBoundsCenter.z)
					] }),
					playerVisualStatus.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: playerVisualStatus.error })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "top-hud command-bar glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "captain",
						onClick: () => setPanel(panel ? null : "inventory"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "captain-mark",
							children: "AD"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "captain-copy",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: saveRef.current.playerName.toUpperCase() }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["LV ", hud.level] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bars",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "RUMPF" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { style: { width: `${hud.hp / hud.maxHp * 100}%` } }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								hud.hp,
								"/",
								hud.maxHp
							] })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shield",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "SCHUTZ" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { style: { width: `${hud.shield / hud.maxShield * 100}%` } }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									hud.shield,
									"/",
									hud.maxShield
								] })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "command-nav",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: panel === "inventory" ? "active" : "",
								onClick: () => setPanel(panel === "inventory" ? null : "inventory"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "♜" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "ÜBERSICHT" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: panel === "shipyard" ? "active" : "",
								onClick: () => setPanel(panel === "shipyard" ? null : "shipyard"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚓" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "WERFT" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: panel === "missions" ? "active" : "",
								onClick: () => setPanel(panel === "missions" ? null : "missions"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✦" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "MISSION" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: panel === "map" ? "active" : "",
								onClick: () => setPanel(panel === "map" ? null : "map"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◈" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "SEEKARTE" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: panel === "port" ? "active" : "",
								onClick: () => setPanel(panel === "port" ? null : "port"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "▦" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "GESCHÄFT" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: panel === "events" ? "active" : "",
								onClick: () => setPanel(panel === "events" ? null : "events"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "★" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "EREIGNIS" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "currency",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "coin gold",
								children: "◆"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.gold.toLocaleString("de-DE") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "coin pearl",
								children: "●"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.pearls })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "quest-card glass",
				onClick: () => setPanel("missions"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "quest-icon",
					children: "✦"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "AKTIVE MISSION" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: activeQuest.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${questProgress / activeQuest.goal * 100}%` } }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [
						questProgress,
						" / ",
						activeQuest.goal,
						" · ",
						activeQuest.text
					] })
				] })]
			}),
			hud.selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: `target-card glass ${targetInRange ? "locked" : "approaching"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "target-icon",
						children: activeMonster ? "☠" : "⚔"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							activeMonster ? "SEEUNGEHEUER" : "KI-GEGNER",
							" · LV ",
							hud.selected.level
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.selected.name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							className: "target-track",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { style: { width: `${hud.selected.hp / hud.selected.maxHp * 100}%` } })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [targetInRange ? "ERFASST" : "ANFAHRT", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [hud.selected.range, " m"] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Ziel lösen",
						onClick: () => {
							gameRef.current.selectedId = null;
						},
						children: "×"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "minimap chart-frame glass",
				onClick: () => setPanel("map"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["SEKTOR ", map.sector] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [
						"X:",
						Math.round(hud.x / 10),
						" Y:",
						Math.round(hud.y / 10)
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mini-sea",
						children: [
							map.islands.map((i, n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: {
								left: `${i.x / map.width * 100}%`,
								top: `${i.y / map.height * 100}%`
							} }, n)),
							gameRef.current.entities.filter((e) => e.hp > 0).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", {
								className: `${monsters.has(e.kind) ? "monster" : "hostile"} ${e.id === gameRef.current.selectedId ? "selected" : ""}`,
								style: {
									left: `${e.x / map.width * 100}%`,
									top: `${e.y / map.height * 100}%`
								}
							}, e.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								style: {
									left: `${gameRef.current.player.x / map.width * 100}%`,
									top: `${gameRef.current.player.y / map.height * 100}%`
								},
								children: "▲"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: map.name }),
						"GEFAHR ",
						map.danger,
						" · STÄRKE ",
						map.recommended
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "toast-stack",
				children: toasts.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `toast ${t.kind}`,
					children: t.text
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "battle-log glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "KAMPFSTATUS" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.selected ? targetInRange ? `${hud.selected.name} erfasst` : `Anfahrt auf ${hud.selected.name}` : `Freie Fahrt · ${map.name}` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						activeQuest.title,
						": ",
						questProgress,
						"/",
						activeQuest.goal
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "camera-control-group",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "zoom-controls glass",
						"aria-label": "Zoom",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => adjustZoom(.12),
							"aria-label": "Heranzoomen",
							title: "Heranzoomen",
							children: "+"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => adjustZoom(-.12),
							"aria-label": "Herauszoomen",
							title: "Herauszoomen",
							children: "−"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "recenter-ship-btn glass",
						"aria-label": "Zurück zum Schiff",
						title: "Zurück zum Schiff",
						onClick: recenterCamera,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚓" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "SCHIFF" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "joystick camera-stick",
						"aria-label": "Kartenkamera verschieben",
						title: "Kamera verschieben",
						onPointerDown: joystickMove,
						onPointerMove: (e) => e.buttons && joystickMove(e),
						onPointerUp: joystickEnd,
						onPointerCancel: joystickEnd,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "‹　›" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "KAMERA" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "settings-quick-btn glass",
				"aria-label": "Einstellungen",
				title: "Einstellungen",
				onClick: () => setPanel(panel === "settings" ? null : "settings"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚙" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "combat-cluster combat-cluster-v25",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "combat-skill-row glass ability-controls",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => activateAbility("surge"),
								className: abilityHud.surge > 0 ? "cooling" : "",
								"aria-label": "Sturmsegel",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "≋" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "STURMSEGEL" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: abilityHud.surge > 0 ? `${Math.ceil(abilityHud.surge)} S` : "TEMPOSCHUB" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => activateAbility("volley"),
								className: abilityHud.volley > 0 ? "cooling" : "",
								"aria-label": "Streusalve",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✺" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "STREUSALVE" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: abilityHud.volley > 0 ? `${Math.ceil(abilityHud.volley)} S` : "4 KUGELN" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => activateAbility("aegis"),
								className: abilityHud.aegis > 0 ? "cooling" : "",
								"aria-label": "Reliktschild",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⬡" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "RELIKTSCHILD" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: abilityHud.aegis > 0 ? `${Math.ceil(abilityHud.aegis)} S` : "6 PERLEN" })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "combat-primary-row battle-controls",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "target-button",
								onClick: cycleTarget,
								"aria-label": "Ziel wechseln",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⌖" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "ZIEL" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `auto-button ${autoFire ? "active" : ""}`,
								onClick: () => {
									const n = !autoFire;
									setAutoFire(n);
									gameRef.current.autoFire = n;
								},
								"aria-label": "Automatisches Feuer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◎" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "AUTO" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: `fire-button ${activeMonster ? "harpoon" : ""} ${targetInRange ? "ready" : ""}`,
								onPointerDown: fire,
								"aria-label": "Feuer",
								style: { "--cooldown": `${cooldown * 360}deg` },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: activeMonster ? "↯" : "☄" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: activeMonster ? "HARPUNE" : "FEUER" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: !hud.selected ? "ZIEL WÄHLEN" : targetInRange ? "BEREIT" : `${hud.selected.range} M` })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "repair-button",
								onClick: repair,
								"aria-label": "Reparatur",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✚" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.repairKits }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "REPARATUR" })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "combat-ammo-row ammo-select glass",
						children: Object.keys(AMMO).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: ammo === a ? "active" : "",
							onClick: () => selectAmmo(a),
							title: AMMO[a].effect,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: AMMO[a].color },
									children: a === "harpoon" ? "↯" : a === "fire" ? "✹" : "●"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: AMMO[a].short }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.ammo[a] >= 999 ? "∞" : hud.ammo[a] })
							]
						}, a))
					})
				]
			}),
			!started && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "start-screen",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "crest",
						children: "♜"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "THE ABYSSAL CHRONICLES" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
						"ABYSSAL",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DOMINION" })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ornament",
						children: "◆　⚓　◆"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "intro",
						children: [
							"Segle per Klick oder Touch. Baue deine Flotte, rüste Breitseiten aus",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"und bezwinge fünf Reiche voller Beute und Seeungeheuer."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: start,
						children: ["IM VOLLBILD STARTEN ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Lokaler Spielstand · Querformat · Vollbildmodus" })
				]
			}),
			death && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "death-screen",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "☠" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [SHIPS[hud.shipId].name.toUpperCase(), " VERSENKT"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Die Tiefe fordert ihren Tribut" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: death }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verlust: keine Ausrüstung · Respawn im sicheren Hafen Aster" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: respawn,
						children: "IM HAFEN BERGEN"
					})
				]
			}),
			panel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "drawer glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "close",
						onClick: () => setPanel(null),
						children: "×"
					}),
					panel === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "STEUERUNG & DARSTELLUNG" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Einstellungen" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "settings-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "STEUERUNG" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "settings-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kamera-Geschwindigkeit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: cameraPanSpeed,
										onChange: (event) => updateCameraPanSpeed(event.target.value),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "slow",
												children: "Langsam"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "normal",
												children: "Normal"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "fast",
												children: "Schnell"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "settings-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Zoom-Empfindlichkeit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: zoomSensitivity,
										onChange: (event) => updateZoomSensitivity(event.target.value),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "low",
												children: "Niedrig"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "normal",
												children: "Normal"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "high",
												children: "Hoch"
											})
										]
									})]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "GRAFIK" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "settings-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Grafikqualität" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: qualityPreference,
									onChange: (event) => {
										const value = event.target.value;
										saveQualityPreference(value);
										saveRef.current.settings = {
											...saveRef.current.settings,
											qualityProfile: value
										};
										writeSave(saveRef.current).catch(() => void 0);
										setQualityPreference(value);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "AUTO",
											children: "AUTO"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "LOW",
											children: "LOW"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "MEDIUM",
											children: "MEDIUM"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "HIGH",
											children: "HIGH"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "ULTRA",
											children: "ULTRA"
										})
									]
								})]
							})] })]
						})
					] }),
					panel === "missions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
							"LOGBUCH · ",
							hud.completed.length,
							"/",
							QUESTS.length
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Missionen" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mission-list",
							children: QUESTS.map((q) => {
								const done = hud.completed.includes(q.id), p = Math.min(q.goal, hud.progress[q.type] || 0);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: done ? "done" : "",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: done ? "✓" : "✦" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: q.title }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: q.text }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { style: { width: `${p / q.goal * 100}%` } }) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
											p,
											"/",
											q.goal,
											" · ",
											q.reward
										] })
									] })]
								}, q.id);
							})
						})
					] }),
					panel === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "NAUTISCHE KARTE" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fünf Reiche" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "map-grid",
							children: Object.keys(MAPS).map((id) => {
								const m = MAPS[id], locked = id === "gloam" && hud.level < 2 || id === "coral" && hud.level < 3 || id === "maelstrom" && hud.level < 4 || id === "abyss" && hud.level < 5 && hud.mapFragments < 8;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: hud.mapId === id ? "current" : "",
									onClick: () => travel(id),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: locked ? "🔒" : id === "abyss" ? "◉" : id === "coral" ? "✺" : "≈" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.name }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
											m.sector,
											" · Gefahr ",
											m.danger,
											" · Stärke ",
											m.recommended
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: hud.mapId === id ? "AKTUELL" : locked ? "NOCH GESPERRT" : "KURS SETZEN" })
									]
								}, id);
							})
						})
					] }),
					panel === "port" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "HAFEN ASTER · SICHERE ZONE" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hafenviertel" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "port-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setPanel("shipyard"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚓" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "KRONENWERFT" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Schiffe kaufen, wechseln und Kanonen ausrüsten" })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setPanel("cauldron"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "♨" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "GEZEITENKESSEL" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Mojo opfern, Beute und Kartenfragmente gewinnen" })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shop-list",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
									name: "Reparaturkit",
									text: "Stellt unterwegs 450 Rumpf wieder her",
									price: "600 ◆",
									action: () => buy("repair")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
									name: "80 Eisenkugeln",
									text: "Standardreserve für lange Jagden",
									price: "300 ◆",
									action: () => buy("iron")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
									name: "25 Panzerbrecher",
									text: "Bonus gegen gepanzerte Ziele",
									price: "850 ◆",
									action: () => buy("piercing")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
									name: "Gezeiten-Mojo",
									text: "Ritualopfer für den Kessel",
									price: "500 ◆",
									action: () => buy("mojo")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
									name: `Kanonenstufe ${hud.cannonLevel + 1}`,
									text: "+12 % Kanonenschaden",
									price: `${1600 * hud.cannonLevel} ◆`,
									action: () => buy("cannon")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
									name: `Harpunenstufe ${hud.harpoonLevel + 1}`,
									text: "+12 % Monsterschaden",
									price: `${1400 * hud.harpoonLevel} ◆`,
									action: () => buy("harpoon")
								})
							]
						})
					] }),
					panel === "shipyard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
							"KRONENWERFT · FLOTTE ",
							hud.ownedShips.length,
							"/4"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Schiffe & Breitseiten" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "deck-upgrade",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "deck-pips",
									children: Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
										className: i < hud.deckLevel ? "filled" : "",
										style: { "--pip": DECK_LEVELS[i + 1].color }
									}, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										"AKTIVES OBERDECK · STUFE ",
										hud.deckLevel,
										"/6"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: currentDeck.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"☄ ",
										currentDeck.weaponSlots,
										" Waffenplätze · ◇ ",
										currentDeck.expansionSlots,
										" Erweiterungsplätze"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [
										"Rumpf +",
										Math.round(currentDeck.hpBonus * 100),
										" % · Schutz +",
										Math.round(currentDeck.shieldBonus * 100),
										" %"
									] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: upgradeDeck,
									disabled: hud.deckLevel >= 6,
									children: hud.deckLevel < 6 ? `${nextDeck.name} · ${nextDeck.cost.toLocaleString("de-DE")} ◆` : "MAXIMAL AUSGEBAUT"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Schiffdesigns" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "fleet-grid",
							children: Object.keys(SHIPS).map((id) => {
								const ship = SHIPS[id], owned = hud.ownedShips.includes(id), active = hud.shipId === id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: `fleet-card ${active ? "active" : ""}`,
									style: { "--accent": ship.color },
									role: "button",
									tabIndex: 0,
									onClick: () => chooseShip(id),
									onKeyDown: (event) => {
										if (event.key === "Enter" || event.key === " ") chooseShip(id);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `ship-showcase ${id}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
												src: SHIP_ART[id],
												alt: `${ship.name} – eigenes Schiffdesign`,
												width: 512,
												height: 384,
												sizes: "(max-width: 820px) 45vw, 320px"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ship.name }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [ship.role, " · sofort verfügbar"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: ship.description }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											ship.hp,
											" Rumpf · ",
											ship.shield,
											" Schutz · ",
											ship.speed,
											" Fahrt"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { children: active ? "AKTIV" : owned ? "AUSRÜSTEN" : `${ship.price.toLocaleString("de-DE")} ◆` })
									]
								}, id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Kanonenbatterien" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "cannon-grid",
							children: Object.keys(CANNONS).map((id) => {
								const cannon = CANNONS[id], owned = hud.ownedCannons.includes(id), active = hud.cannonId === id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: active ? "active" : "",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: { color: cannon.color },
											children: "☄"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cannon.name }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: cannon.description }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [
												"Schaden ×",
												cannon.damage,
												" · Nachladen ×",
												cannon.reload,
												" · Reichweite ×",
												cannon.range
											] })
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => chooseCannon(id),
											children: active ? "AKTIV" : owned ? "AUSRÜSTEN" : `${cannon.price.toLocaleString("de-DE")} ◆`
										})
									]
								}, id);
							})
						})
					] }),
					panel === "cauldron" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "VERBORGENER HAFEN · TÄGLICHES RITUAL" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Der Gezeitenkessel" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `cauldron ${ritualing ? "ritualing" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "cauldron-orbit",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "cauldron-bowl",
									children: "♨"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ritualResult }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Opfere Mojo für Munition, Materialien, Perlen oder seltene Fragmente der Gezeitenkarte. Spätestens nach neun Ritualen erscheint ein Kartenfragment." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ritual-stats",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: hud.mojos }), " Mojo"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [hud.mapFragments, "/8"] }), " Kartenfragmente"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [Math.min(9, hud.cauldronPity), "/9"] }), " Fragmentgarantie"] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: performRitual,
									disabled: ritualing,
									children: ritualing ? "DIE GEZEITEN ANTWORTEN …" : saveRef.current.lastFreeRitual !== (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) ? "KOSTENLOSES TAGESRITUAL" : "1 MOJO OPFERN"
								})
							]
						})
					] }),
					panel === "events" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "SAISON-EREIGNIS · LOKAL GEGEN KI" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sturmflut der Vergessenen" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "event-hero",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "event-sigil",
								children: "☠"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "ZEITLICHES FANTASY-EREIGNIS" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Die Flotte der Hohlen Krone" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Jage Geisterschiffe, sammle Gezeitensiegel und bezwinge anschließend den Elitekapitän in Sturmbruch." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.min(100, (hud.kills + hud.monsters) * 10)}%` } }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [Math.min(10, hud.kills + hud.monsters), " / 10 Gezeitensiegel"] })
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "event-rewards",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◆" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "2.500 Gold" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "bei 4 Siegeln" })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "●" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "80 Perlen" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "bei 7 Siegeln" })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "♜" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hohlen-Relikt" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "bei 10 Siegeln" })
								] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "event-course",
							onClick: () => {
								setPanel(null);
								travel(hud.level >= 4 ? "maelstrom" : "gloam");
							},
							children: "EREIGNISKARTE ANSTEUERN"
						})
					] }),
					panel === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [SHIPS[hud.shipId].name.toUpperCase(), " · AUSRÜSTUNG"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Schiff und Vorräte" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "loadout",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "♜" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: SHIPS[hud.shipId].name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										SHIPS[hud.shipId].role,
										" · ",
										hud.ownedShips.length,
										" Schiffe"
									] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "☄" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
										CANNONS[hud.cannonId].name,
										" · Stufe ",
										hud.cannonLevel
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										"Schaden +",
										(hud.cannonLevel - 1) * 12,
										"%"
									] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↯" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["Harpunenwerfer · Stufe ", hud.harpoonLevel] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										"Monsterschaden +",
										(hud.harpoonLevel - 1) * 12,
										"%"
									] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "▦" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
										currentDeck.name,
										" · Stufe ",
										hud.deckLevel
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										currentDeck.weaponSlots,
										" Waffen · ",
										currentDeck.expansionSlots,
										" Erweiterungen"
									] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⬡" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Rumpf & Schutz" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										hud.maxHp,
										" Rumpf · ",
										hud.maxShield,
										" Schutz"
									] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "♨" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [hud.mojos, " Gezeiten-Mojo"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [hud.mapFragments, "/8 Kartenfragmente"] })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◆" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Bergungsmaterial" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [hud.materials, " Fragmente"] })
								] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "save-actions",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: exportSave,
									children: "SPIELSTAND EXPORTIEREN"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => fileRef.current?.click(),
									children: "IMPORTIEREN"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "danger",
									onClick: () => {
										if (confirm("Lokalen Spielstand wirklich zurücksetzen?")) resetSave().then(() => location.reload());
									},
									children: "ZURÜCKSETZEN"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "quality-setting",
									children: ["GRAFIKQUALITÄT", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: qualityPreference,
										onChange: (event) => {
											const value = event.target.value;
											saveQualityPreference(value);
											saveRef.current.settings = {
												...saveRef.current.settings,
												qualityProfile: value
											};
											writeSave(saveRef.current).catch(() => void 0);
											setQualityPreference(value);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "AUTO",
												children: "AUTO"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "LOW",
												children: "LOW"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "MEDIUM",
												children: "MEDIUM"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "HIGH",
												children: "HIGH"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "ULTRA",
												children: "ULTRA"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "application/json",
									hidden: true,
									onChange: importSave
								})
							]
						})
					] })
				]
			}),
			panel === "port" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "upgrade-dock glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "WERFT-AUSBAU" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Schiffssysteme" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => buy("hull"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⬡" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["Rumpf Stufe ", saveRef.current.hullLevel] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								"+8 % Rumpf · ",
								1250 * (saveRef.current.hullLevel ?? 1),
								" ◆"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => buy("sails"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "≋" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["Segel Stufe ", saveRef.current.sailLevel] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								"Fahrtvorbereitung · ",
								1100 * (saveRef.current.sailLevel ?? 1),
								" ◆"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => buy("crew"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "♟" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["Besatzung Stufe ", saveRef.current.crewLevel] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								"Schaden & Nachladen · ",
								1500 * (saveRef.current.crewLevel ?? 1),
								" ◆"
							] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hint",
				children: "TOUCH: KURS SETZEN · LINKER STICK: KARTE · +/−: ZOOM · PINCH: ZOOM"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rotate-device",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "↻" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Handy drehen" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Abyssal Dominion wird im Querformat gespielt." })
				]
			})
		]
	});
}
function Shop({ name, text, price, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: text })] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: price }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: action,
			children: "KAUFEN"
		})
	] });
}
//#endregion
export { Home as default };
