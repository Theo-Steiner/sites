import { API_BASE } from '$lib/env';

const months = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');

function formatPubdate(str) {
	const [y, m, d] = str.split('-');
	return `${d} ${months[+m]} ${y} 12:00 +0000`;
}

function escapeHTML(html) {
	const chars = {
		'"': 'quot',
		"'": '#39',
		'&': 'amp',
		'<': 'lt',
		'>': 'gt'
	};

	return html.replace(/["'&<>]/g, c => `&${chars[c]};`);
}

const get_rss = posts =>
	`
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
	<title>Svelte blog</title>
	<link>https://svelte.dev/blog</link>
	<description>News and information about the magical disappearing UI framework</description>
	<image>
		<url>https://svelte.dev/favicon.png</url>
		<title>Svelte</title>
		<link>https://svelte.dev/blog</link>
	</image>
	${posts
		.filter(post => !post.draft)
		.map(
			post => `
		<item>
			<title>${escapeHTML(post.title)}</title>
			<link>https://svelte.dev/blog/${post.slug}</link>
			<description>${escapeHTML(post.description)}</description>
			<pubDate>${formatPubdate(post.date.numeric)}</pubDate>
		</item>
	`
		)
		.join('')}
</channel>

</rss>
`
		.replace(/>[^\S]+/gm, '>')
		.replace(/[^\S]+</gm, '<')
		.trim();

export async function get() {
	const posts = await (await fetch(`${API_BASE}/docs/svelte/blog`)).json();

	return {
		body: get_rss(posts),
		headers: {
			'Cache-Control': `max-age=${30 * 60 * 1e3}`,
			'Content-Type': 'application/rss+xml'
		}
	};
}
