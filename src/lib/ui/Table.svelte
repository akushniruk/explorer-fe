<div class="bg-card border border-border rounded-lg overflow-hidden">
	<table class="w-full">
		<thead class="bg-muted/30">
			<tr class="text-xs font-medium text-muted-foreground border-b border-border">
				<slot name="head" />
			</tr>
		</thead>
		<tbody class="divide-y divide-border/60">
			<slot />
		</tbody>
	</table>
</div>
