import sanitizeHtml from "sanitize-html";

export default function sanitize(html) {
	return sanitizeHtml(html, {
		allowedTags: [
			...sanitizeHtml.defaults.allowedTags,
			"h2", "sup", "sub", "img"
		],
		disallowedTagsMode: "escape",
	});
}
