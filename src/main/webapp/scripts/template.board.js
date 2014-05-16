<thead>
	<tr>
		<td>&nbsp;</td>

		{{#each letters}}
		<td>{{this}}</td>
		{{/each}}

		<td>&nbsp;</td>
	</tr>
</thead>
<tbody>
	{{#times 8}}
	<tr>
		<td>{{this}}</td>

		{{#each ../letters}}
		<td id="{{this}}{{../this}}">{{genPiece this ../this ../../pos}}</td>
		{{/each}}

		<td>{{this}}</td>
	<tr>
	{{/times}}
</tbody>
<tfoot>
	<tr>
		<td>&nbsp;</td>

		{{#each letters}}
		<td>{{this}}</td>
		{{/each}}

		<td>&nbsp;</td>
	</tr>
</tfoot>