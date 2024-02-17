// event.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext } from '@unkey/hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from 'hono/types';

const app = new Hono<{ Bindings: Bindings; Variables: { unkey: UnkeyContext; db: DbType } }>();

app.get('/', async (c) => {
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}
	const events = await c.get('db').query.event.findMany({
		where: eq(schema.event.orgId, metadata.orgId),
		orderBy: (event, { desc }) => [desc(event.start)]
	});

	return c.json(events);
});
app.get('/:id', async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const event = await c.get('db').query.event.findFirst({
		where: and(eq(schema.event.orgId, metadata.orgId), eq(schema.event.id, c.req.param('id'))),
		orderBy: (event, { desc }) => [desc(event.start)]
	});

	if (!event) {
		throw new HTTPException(404, {
			message: 'Event not found'
		});
	}

	return c.json(event);
});

export default app;