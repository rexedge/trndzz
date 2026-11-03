import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotificationsNotFound() {
	return (
		<div className='rounded-2xl border border-border bg-card p-10 text-center space-y-4'>
			<h2 className='text-xl font-bold'>Notification Log Not Found</h2>
			<p className='text-sm text-muted-foreground'>
				The requested alert record could not be located.
			</p>
			<Button asChild size='sm'>
				<Link href='/admin/notifications'>Back to Alert Outbox</Link>
			</Button>
		</div>
	);
}

