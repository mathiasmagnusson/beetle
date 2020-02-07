export default function depthify(obj) {
	if (typeof obj !== "object") return obj;
	if (obj instanceof Array) return obj.map(depthify);

	let ret = {};
	for (const [key, val] of Object.entries(obj)) {
		if (!key.includes("."))
			ret[key] = depthify(val);
		else {
			let split = key.split(".");
			let curr = ret;
			while (split.length > 1) {
				const part = split.shift();
				if (!curr.hasOwnProperty(part)) {
					curr[part] = {};
				}
				curr = curr[part];
			}
			curr[split.shift()] = depthify(val);
		}
	}
	return ret;
}
