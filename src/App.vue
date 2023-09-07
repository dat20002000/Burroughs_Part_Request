<!--
/**
 * @class BurroughPartRequest
 * @brief VUE Component for the OFS Part Request plugin
 * @author Kevin Browne <kevinbrowne@helixmail.com>
 * @version 1.0
 *
 */
-->

<template>
<v-app>
	<v-snackbar v-model="snackbar" :timeout="snackBarTimeout" :top="true" :color="snackbarcolor" multi-line>
		{{ snackbartext }}
	</v-snackbar>



	<!-- Part Request Detail DIALOG -->
	<v-dialog v-model="partOrderDetailDialog" scrollable max-width="700px" fullscreen transition="dialog-bottom-transition" hide-overlay>

		<v-card>
			<v-toolbar short dense max-height="50" color="white" class="black--text">
				<v-toolbar-title>Part Request Details ({{ selectedPartRequestId }}) </v-toolbar-title>
				<v-spacer />
				<v-toolbar-items>
					<v-btn icon dark color="black" class="black--text" @click="handlePartDetailCancelButton">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-toolbar-items>
			</v-toolbar>
			<v-divider />

			<v-data-table :headers="partRequestLineHeaders" :items="partRequestLines" :single-expand="singleExpand" :expanded.sync="expanded" item-key="detailId" show-expand class="elevation-1">

				<!-- BEGIN table top template -->
				<template #top>
					<v-toolbar flat>
						<v-toolbar-title>&nbsp;</v-toolbar-title>
						<v-spacer />
						<!-- TODO: Single Expand switch is just for the demo to show what's possible.  Can remove -->
						<!-- TODO: Possibly add an exapnd all and collapse all function? -->
						<v-switch v-model="singleExpand" label="Single expand" class="mt-2" />
					</v-toolbar>
				</template>
				<!-- BEGIN table top template -->

				<!-- BEGIN items template -->
				<template #item="{ item, expand, isExpanded }">

					<!-- green -->
					<tr v-if="item.transactionlinetype === 'INTRANSIT'" style="background-color: #CCFFCC !important">
						<td>
							<v-btn small @click="expand(!isExpanded)">
								<v-icon v-if="isExpanded" color="grey darken-3" small>
									mdi-arrow-expand-up
								</v-icon>
								<v-icon v-else color="grey darken-3" small>
									mdi-arrow-expand-down
								</v-icon>
							</v-btn>
						</td>
						<td>{{ item.partNumber }}</td>
						<td>{{ item.desc }}</td>
						<td>{{ formatEtaDateString(item.eta) }}</td>
						<td>{{ item.orderedQuantity }}</td>
						<td>{{ item.pendingQuantity }}</td>
					</tr>					

					<!-- white -->
					<tr v-else-if="item.transactionlinetype === 'RECEIVING'">
						<td>
							<v-btn small @click="expand(!isExpanded)">
								<v-icon v-if="isExpanded" color="grey darken-3" small>
									mdi-arrow-expand-up
								</v-icon>
								<v-icon v-else color="grey darken-3" small>
									mdi-arrow-expand-down
								</v-icon>
							</v-btn>
						</td>
						<td>{{ item.partNumber }}</td>
						<td>{{ item.desc }}</td>
						<td>{{ formatEtaDateString(item.eta) }}</td>
						<td>{{ item.orderedQuantity }}</td>
						<td>{{ item.pendingQuantity }}</td>
					</tr>

					<!-- red -->
					<tr v-else style="background-color: #f72020 !important">
						<td>
							<v-btn small @click="expand(!isExpanded)">
								<v-icon v-if="isExpanded" color="grey darken-3" small>
									mdi-arrow-expand-up
								</v-icon>
								<v-icon v-else color="grey darken-3" small>
									mdi-arrow-expand-down
								</v-icon>
							</v-btn>
						</td>
						<td>{{ item.partNumber }}</td>
						<td>{{ item.desc }}</td>
						<td>{{ formatEtaDateString(item.eta) }}</td>
						<td>{{ item.orderedQuantity }}</td>
						<td>{{ item.pendingQuantity }}</td>
					</tr>
				</template>
				<!-- END items template -->

				<!-- BEGIN expanded items template -->
				<template #expanded-item="{ headers, item}">
					<td :colspan="headers.length">
						<template>
							<v-simple-table>
								<template #default>
									<thead>
										<tr>
											<th class="text-left">
												SO#
											</th>
											<th class="text-left">
												Ship Quantity
											</th>
											<th class="text-left">
												Actual ETA
											</th>
											<th class="text-left">
												Carrier
											</th>
											<th>
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="sitem in computedShipLines(item.lineNumber)" :key="sitem.id" class="shipline">
											<td>{{ sitem.soNumber }}</td>
											<td>{{ sitem.shipQuantity }}</td>
											<td>{{ formatEtaDateString(sitem.eta) }}</td>
											<td>
												<img class="ship-icon" :src="sitem.icon">
											</td>
											<td>
												<v-btn small color="grey darken-3" class="white--text" @click="handleTrackButtonClick(sitem)" :disabled="typeof sitem.trackingURL === 'undefined' || sitem.trackingURL === null || sitem.trackingURL.length === 0 || typeof sitem.trackingNumber === 'undefined' || sitem.trackingNumber === null || sitem.trackingNumber.length === 0">
													Track
												</v-btn>
											</td>
										</tr>
									</tbody>
								</template>
							</v-simple-table>
						</template>
					</td>
				</template>
				<!-- END expanded items template -->
			</v-data-table>

			<v-spacer />

			<v-card-actions>
				<v-spacer />
				<v-btn color="red darken-4" class="white--text" @click="handlePartDetailCancelButton">
					Dismiss
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- END Part Request Detail Dialog -->



	<v-main>
		<v-container fluid>
			<v-overlay :value="overlay">
				<v-progress-circular indeterminate size="64" />
			</v-overlay>

			<v-row>
				<v-col cols="2" />
				<v-col cols="2" />
				<v-col cols="6" sm="8" md="4" />
			</v-row>
			<v-row>
				<v-col>
					<v-row>
						<v-col cols="6">
							<v-text-field v-model="partRequestSearchQuery" prepend-inner-icon="mdi-filter" outlined hint="Examples: 9876543, Smith, pre-approval" persistent-hint label="Filter Results by Keyword" />
						</v-col>
					</v-row>
					<v-data-table :loading="requestResultsLoading" :headers="PartRequestHeaders" :items="partRequestHeaderItems" :search="partRequestSearchQuery" item-key="requestId" height="600px">
						<template #[`item.actions`]="{ item }">
							<v-btn small color="grey darken-3" class="white--text" @click="handleOrderDetailsButtonClick(item)">
								Details
							</v-btn>
						</template>
					</v-data-table>
				</v-col>
			</v-row>
		</v-container>
	</v-main>
</v-app>
</template>

<script>

// Currently tracking POTENTIAL common code in Mixins within this project only.  Will
// compare and merge later.
import commonVue from './mixins/CommonVue.js';
import commonOfs from './mixins/CommonOfs.js';

export default {

	name: "BurroughPartRequest",
	mixins: [commonVue, commonOfs],

	data: () => ({


		// Set up object structure for the expected OFS configuration parameters and properties.  This allows us to run a routine to check
		// if all config parameters exist and are valid.  Initial values here should always be null.
		ofs: {
			config: {
				netsuiteUser: {
					description: 'Username for NetSuite instance',
					value: null,
					required: true
				},
				netsuitePassword: {
					description: 'Password for NetSuite instance',
					value: null,
					required: true
				},
				partRequestHeaderEndpoint: {
					description: 'Endpoint used to retrieve Part Request header information',
					value: null,
					required: true
				},
				partRequestDetailEndpoint: {
					description: 'Endpoint used to retrieve Part Request detail information',
					value: null,
					required: true
				}
			},
			props: {
				callId: {
					description: 'The Burrough CallID / TaskID',
					value: null,
					required: false
				},
				technicianId: {
					description: 'The Burrough Technician ID (OFS external ID)',
					value: null,
					required: true
				},
				lob: {
					description: 'The Burrough Line of Business (Resource LOB)',
					value: null,
					required: true
				}
			}
		},

		overlay: false,

		PartRequestHeaders: [
			{
				text: 'Request #',
				value: 'requestId'
			},
			{
				text: 'Status:',
				value: 'status'
			},
			{
				text: 'Customer',
				value: 'customer'
			},
			{
				text: 'Call Id',
				value: 'callId'
			},
			{
				text: 'Last Date Shipped',
				value: 'dateShipped'
			},
			{
				text: 'WHS Code:',
				value: 'whCode'
			},
			{
				text: 'Action',
				value: 'actions'
			}
		],

        requestBody: {
			payload: {}
		},

		icon: "",
		trackingURL: "",

		partRequestHeaderItems: [],
		requestResultsLoading: true,
		partRequestSearchQuery: "",
		partOrderDetailDialog: false,
		orderDetailsAreLoading: false,
		selectedPartRequestId: null,


		singleExpand: false,

		partRequestLineHeaders: [
			{
				text: 'Part Number',
				align: 'start',
				sortable: false,
				value: 'partNumber',
			},
			{
				text: 'Description',
				value: 'desc'
			},
			{
				text: 'Estimated ETA',
				value: 'eta'
			},
			{
				text: 'Ordered Quantity',
				value: 'orderedQuantity'
			},
			{
				text: 'Pending Quantity',
				value: 'pendingQuantity'
			}
		],


		// Array for Part Request detail lines
		partRequestLines: [],

		// Part Request ship lines
		shipLines: []


	}),
	// END DATA


	computed: {

		expanded: 
		{
			get: function() {

			let arr = [];

			this.partRequestLines.forEach(function(detailItem) {

				if (detailItem.pendingQuantity > 0)
				{
					let expItem = {};
					expItem.detailId = detailItem.detailId;
					arr.push(expItem);
				}

			});

			return arr;

			}, 
			
			set: function (arr) {
				return arr
			}
		}		

	},


	/**
	 * Instance lifecycle hook which runs upon create of the VUE component.
	 * @return (void)
	 */
	created: function () {
		this.log('created() - BEGIN');

		// -- BUILD VERSION STUFF ------------------
		this.log('created() - Build created on ' + process.env.BUILD_DATE + ' using branch ' + process.env.GIT_CURRENT_BRANCH + ' from commit ' + process.env.GIT_COMMIT_HASH);

		if (process.env.GIT_WORKING_COPY_STATUS.toString().length > 0) {
			this.log('created() - Locally modified files:');
			console.log(process.env.GIT_WORKING_COPY_STATUS);
		}
		// -- END BUILD VERSION STUFF ------------------


		// Localhost or standalone domain testing (not running within OFS at all)
		if (window.self === window.top) {

			this.log('Mode: localhost or standalone');
			this.runningWithinOfs = false;


			// Set any test data for running standalone, outside of OFS...

			// DEV
			/*
			this.ofs.config.partRequestHeaderEndpoint.value = 'https://csaofsintegrationdev-axbidh7pqpgy-ia.integration.ocp.oraclecloud.com/ic/api/integration/v1/flows/rest/PLUGIN_GET_PART_REQUES_HEADER/1.0';
			this.ofs.config.partRequestDetailEndpoint.value = 'https://csaofsintegrationdev-axbidh7pqpgy-ia.integration.ocp.oraclecloud.com/ic/api/integration/v1/flows/rest/PLUGIN_GET_PART_REQUES_DETAIL/1.0';
			this.ofs.config.netsuiteUser.value = ''; // <-- Delete after any localhost development or testing!
			this.ofs.config.netsuitePassword.value = ''; // <-- Delete after any localhost development or testing!
			this.ofs.props.lob.value = 'PPS-LFS';
			this.ofs.props.callId.value = '12345';
			this.ofs.props.technicianId.value = 'K04072';
			*/

			// QA
			this.ofs.config.partRequestHeaderEndpoint.value = 'https://ofsproxy2.burroughs.com:5000/proxy/netsuite/services/rest/query/v1/suiteql';
			this.ofs.config.partRequestDetailEndpoint.value = 'https://ofsproxy2.burroughs.com:5000/proxy/netsuite/services/rest/query/v1/suiteql';
			this.ofs.config.netsuiteUser.value = 'speridian.ofs.plugin'; // <-- Delete after any localhost development or testing!
			this.ofs.config.netsuitePassword.value = 'Hairplugs90*5'; // <-- Delete after any localhost development or testing!
			this.ofs.props.lob.value = 'PPS-LFS';
			this.ofs.props.callId.value = '12345';
			this.ofs.props.technicianId.value = '005068';

			this.initializePlugin();



		} else {

			this.log('Mode: OFS');
			this.runningWithinOfs = true;

			// Firefox does not have support for document.location.ancestorOrigins.
			// Unlikely OFS will be used in Firefox but falling back just in case.
			this.ofsParentOrigin = typeof document.location.ancestorOrigins !== 'undefined' ? document.location.ancestorOrigins[0] : document.referrer;

			// Define the handler for message events from Field Service
			window.addEventListener('message', this.handleOfsPostMessage);

			// Tell Field Service our plugin is ready
			var msg = {
				apiVersion: 1,
				method: 'ready',
				sendInitData: false,
				showHeader: true,
				enableBackButton: true
			};

			this.postMessage(msg, this.ofsParentOrigin);
		}

	},
	// END created()



	methods: {


		formatEtaDateString(val)
		{
			let retVal = '';

			if (typeof val !== 'undefined' && val !== null && val.length > 0)
			{
				let d = new Date(val);
				let month = d.getUTCMonth() + 1;
				let day = d.getUTCDate();
				let year = d.getUTCFullYear();

				retVal = month.toString().padStart(2, '0') + '/' + day.toString().padStart(2, '0') + '/' + year;
			}

			return retVal;
		},

		computedShipLines: function (lineNumber) {
			var computedShipLines = this.shipLines.filter(result => result.lineNumber === lineNumber)
			return computedShipLines;
		},




		/**
		 * Method used to retrieve Part Request header information.
		 *
		 * @return (void)
		 */
		getPartsRequestHeaders: function () {

			this.log('getPartsRequestHeaders() - BEGIN');

			this.requestBody.payload= {
					"q" : `SELECT transaction.*, location.name FROM transaction INNER JOIN location on location.id=transaction.transferlocation WHERE location.name='CA01-WOAK2'` //  ${this.ofs.props.technicianId.value}
			}			

			// Get the part request headers
			this.makeApiRequest('POST', this.ofs.config.partRequestHeaderEndpoint.value, this.ofs.config.netsuiteUser.value, this.ofs.config.netsuitePassword.value, this.requestBody, this.processPartRequestHeaderResponse);

		},


		/**
		 * Method to process the Part Request header response.
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		processPartRequestHeaderResponse: function (respObj) {

			this.log('processPartRequestHeaderResponse() - BEGIN');
			this.log(respObj);

			if (typeof respObj !== 'undefined') {

				if (respObj.count !== 0) {

					let self = this;
					if (typeof respObj.items !== 'undefined')
					{
						respObj.items.forEach(function (item) {
							self.partRequestHeaderItems.push({
								requestId : item.tranid,
								status : item.status,
								customer : item.shippingaddress,
								callId : item.id,
								dateShipped : item.shipdate,
								whCode: item.name
							});
						});
					}

				}
				else if (respObj.count === 0)
				{
					this.showSnackBar('orange', 'GET Part Request Headers: no data found');

				}
			} else {
				this.showSnackBar('red', 'GET Part Request Headers - Invalid response received from the server!');
			}










			this.requestResultsLoading = false;

		},

		save() {},
		cancel() {},
		open() {},
		close() {},


		/**
		 * Method to handle the click event for the Track button 
		 *
		 * @param item (object) The line item object. 
		 * @return (void)
		 */
		handleTrackButtonClick: function (item) {

			this.log('handleTrackButtonClick()');
			this.log(item);

			if (this.runningWithinOfs === true) {

				let trackingURL = item.trackingURL.replace(/&amp;/g, '&');

				var msg = {
					apiVersion: 1,
					method: "callProcedure",
					procedure: "openLink",
					callId: "123abc",
					params: {
						url: trackingURL
					}
				}

				this.postMessage(msg, this.ofsParentOrigin);

			} else {

				if (typeof item.trackingURL !== 'undefined' && item.trackingURL !== null && item.trackingURL.length > 0)
				{
					let trackingURL = item.trackingURL.replace(/&amp;/g, '&');
					window.open(trackingURL, '_blank');
				}
				else
				{
					this.showSnackBar('orange', 'Tracking URL does not appear to be valid.')
				}
			}

		},


		/**
		 * Method to handle the click event for the Details button
		 *
		 * @param item (object) The line item object.
		 * @return (void)
		 */
		handleOrderDetailsButtonClick: function (item) {

			this.log('handleOrderDetailsButtonClick()');
			this.log(item);

			this.overlay = true;
			this.orderDetailsAreLoading = true;
			this.selectedPartRequestId = item.requestId;

			this.requestBody.payload= {
					"q" : `SELECT transaction.shipcarrier, transaction.custbody_bi_call_number, transaction.custbody_bi_track_num, transactionline.*  FROM transaction, location, transactionline WHERE location.name='CA01-WOAK2' AND  location.id=transaction.transferlocation AND transactionline.transaction=transaction.id AND transactionline.quantity > 0 AND transaction.tranid = '` + this.selectedPartRequestId + "'" //  ${this.ofs.props.technicianId.value}
			}

			//Get the part request number
			this.makeApiRequest('POST', this.ofs.config.partRequestHeaderEndpoint.value, this.ofs.config.netsuiteUser.value, this.ofs.config.netsuitePassword.value, this.requestBody, this.processRequestPartNumberResponse)			

		},

		/**
		 * Method to process the Part Request Number response
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		processRequestPartNumberResponse: function (respObj) {
			this.log('processRequestPartNumberResponse() - BEGIN');
			this.log(respObj);	

			if (typeof respObj !== 'undefined' || respObj.count === 0) {
				
				let self = this;			
				let listpartID = []	

				//Clear arrays
				self.shipLines.length = 0;				

				//Process ship lines
				respObj.items.forEach(function (item){

					listpartID.push(item.item)
					if (item.shipcarrier.includes('USPS'))
					{
						self.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAMAAABA3o1rAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABxVBMVEUAAAD/tQD/3wBsRg9pQxD1rgH0rgH/vgD//wD/vwD/4gD/5AD/3gD/4AD/tQD/tQD/tQD/tQD/tQD/tgD/twD/uAD/uQD/uQD/uwD/xgD/4gD/tAD/tQD/tQD/tgCgbQqjbwrXlwT//wD/tAD/tQC7ggf//wD/vwD9tAC7gQfNjwW5gAe8gwe9gwf//wC8gge+hAfUlATSkwX/tgCYZwuWZgv/tgDppwKdawqbaQropgL8uwDOkAWOXwyNXwzMjgX7ugD/8wD6uQDUlAXTkwX6uQH/9wD/twD2rwHdmwTAhgasdgmibwrtqAKrdglpRBBGKRM4HhU0GxUzGhUyGhVBJRTGigZhPRAzGxUwGBYxGRVAJBR6UA5LLRNgPBFYNhF5Tw6AVQ1QMBKGWQ1pQxC/hAd/VA2yewjSkwWyegitdwm4fwepdAl5UA7BhgazewiweQi9gwdfPBHPkgW7ggdYNxHBhwZiPhDMjwVUNBKqdQm5gAeocwnEiAbTlAWncwnXlwS8ggeFWA22fQhmQRBxSg91TA7WlgR8Ug5EJxN7UQ4tFhbChwY5HxU3HhVTMhJKLBNrRQ82HRU1HBVTMxJVNBL///+8D3TlAAAAR3RSTlMAAAAAAAAAAAAAAAAAAAMHJV2Nqra2qo1dJQMBdOT9/eR0AQOsrAMDrKysrKysAqiog4My4uExVt7dViuU5+aSKgMvh4cvA1HegzoAAAABYktHRJaRaSs5AAAACXBIWXMAAD7+AAA+/gGZa7RrAAAAB3RJTUUH5AscDRM1E5o84AAAAPNJREFUKM9jYEACjIx8/Px8jIwMWAEjn4CgkLCIqJi4hKQUExZ5aRlZOXcPTy9vH3kFRSVMUxiVVdx9/fwDAoOCQ0JV1bAoUNcIC4+IjIoKCoqK1sSmQE0rJjYuPiExICk5RRurAp3UtHS/jMys7Jxc7Cbo5iXmFxQWFZekl2I3QbcsMb2gsLyisqpaB5sCPf2a2rr6hsb6puxmAz0sCpgNWxJa29o7OsO7UoxYsIQmq7FJYLd/T29QVJ+pGRuWoGbnMLfonzBx0uQpllYcnNgig0vJ2sZ2ylQ7ewclbuzRxcDj6OTs4urGy4AbcCgpcaCKAAAd3TdNGmVs3wAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0xMS0yOFQxMzoxOTo1MyswMDowMH1gvy8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMTEtMjhUMTM6MTk6NTMrMDA6MDAMPQeTAAAAIHRFWHRzb2Z0d2FyZQBodHRwczovL2ltYWdlbWFnaWNrLm9yZ7zPHZ0AAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW1iOjpJbWFnZTo6SGVpZ2h0ADI1NunDRBkAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANTEyHHwD3AAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNjA2NTY5NTkzjVpJ2AAAABN0RVh0VGh1bWI6OlNpemUAMTAyNzdCQvdBGbcAAABEdEVYdFRodW1iOjpVUkkAZmlsZTovLy4vdXBsb2Fkcy81Ni9CT0RDSjlxLzI2OTkvdXBzX2xvZ29faWNvbl8xNjc3MTYucG5nwbt9mAAAAABJRU5ErkJggg==';
						self.trackingURL = 'https://www.ups.com/track?loc=en_US&tracknum='
					}
					else if (item.shipcarrier.includes('FedEx'))
					{
						self.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAMAAABA3o1rAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACDVBMVEUAAABDM45CM47VZSxDM41EM49DM45DM45DM45DM45DM45CM49ON4e8XT3XZivVZSzVZSxDM45DM45DM45DM45DM45DM45DM45CM49ON4e8XT3XZivVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45CM4+8XT3XZivVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45DM45DM45CM4/XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45DM45CM45ON4e8XT3XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45CM4/XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45CM4/XZivVZSzVZSzVZSzVZSzVZSzVZSxDM45DNI5DM45DM45DM45DM45CM47XZivVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45DM45CM49ON4e8XT3XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSxEM49DM45DM45DM45DM45DM5BPN4i9XT3XZivVZSxON4e9XTxDM468XTzVZSz////OBluuAAAAqXRSTlMAAAAAAAACFRoZDxEaGRkZCRK33d7igQOU3djb3t1NFtb8wbVorf7xubI+9GI8HTp0Zh8qalq52ks9MzsqAhw8KAHV9/O85MLXw1Ly9f79/fbyhcziZ73mUviRg+nxmPppLtjlgHZI5fr0bwPvLeybn9pBCMPTLR0Uw+Qy8AGagpOx8/vpXpb5xSIOjZ6W1MtuFIC6l6inqaqnoxhwrF0CBBMBDAECAgIEDWEfDgAAAAFiS0dErrlrk6cAAAAJcEhZcwAAPv4AAD7+AZlrtGsAAAAHdElNRQfkCxwNMgYg1UgVAAABG0lEQVQoz2NgoANgZGPn4OTgYmQEc5i4eXj5+PkFmJEUCAoJi4iKMbKAOeISklLSMrJyyArkFRSVlFVgClRXqqlraGohK2BX0NbR1dM3MDRiNDYxNVu5ytzC0sraxtbO3sGRGazAabWzi6ubu4enl5O3iI+vn39AYFBwSGhYeAQzRIFCZFR0TGyckGJMfEJi0so1ySmpDmnpGZlZ2cxQK3JyBRXy8uMKCp2LiktWriotKxeoqFxbVc0MUSDvUZNYWxdb39AYFamU3+Tr19yS3trW3pFZ2Qmxoqu7x4hRr7evf8LESQqTp0ydNn3GzNRZQbPnzJ0HdiQr6/z5rKyMCxZ2LWIUX7h4ydJly21tV9g6MjvaZjMzM9ABAABFGkn5FEBvdgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0xMS0yOFQxMzo1MDowNiswMDowMCt0xqQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMTEtMjhUMTM6NTA6MDYrMDA6MDBaKX4YAAAAIHRFWHRzb2Z0d2FyZQBodHRwczovL2ltYWdlbWFnaWNrLm9yZ7zPHZ0AAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW1iOjpJbWFnZTo6SGVpZ2h0ADI1NunDRBkAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANTEyHHwD3AAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNjA2NTcxNDA21eRtdgAAABJ0RVh0VGh1bWI6OlNpemUAODc2OEJCb31K8QAAAEZ0RVh0VGh1bWI6OlVSSQBmaWxlOi8vLi91cGxvYWRzLzU2L0JPRENKOXEvMjY5OS9mZWRleF9sb2dvX2ljb25fMTcxMTYxLnBuZ7ndHQ0AAAAASUVORK5CYII=';
						self.trackingURL = 'https://www.fedex.com/fedextrack/?trknbr='
					}

					self.shipLines.push({
								icon : self.icon,
								trackingURL : self.trackingURL.concat(item.custbody_bi_track_num),
								trackingNumber: item.custbody_bi_track_num,
								eta: item.expectedshipdate,
								shipQuantity: item.quantity,
								soNumber: item.custbody_bi_call_number,								
								lineNumber: item.item
					});					

				})

				// Clear line arrays
				this.partRequestLines.length = 0;

				//Loop each partID
				listpartID.forEach(function (partID){
					//Get Part Detail
					self.requestBody.payload= {
							"q" : "SELECT transactionline.quantity, transactionline.expectedshipdate, transactionline.transactionlinetype, item.*  FROM transaction, location, transactionline, item WHERE location.name='CA01-WOAK2' AND  location.id=transaction.transferlocation AND transactionline.transaction=transaction.id AND transactionline.quantity > 0 AND transaction.tranid = '"+ self.selectedPartRequestId +"' AND item.id=transactionline.item AND item.id = '" + partID + "'"
					}

					// Pull Order Detail...
					self.makeApiRequest('POST', self.ofs.config.partRequestDetailEndpoint.value, self.ofs.config.netsuiteUser.value, self.ofs.config.netsuitePassword.value, self.requestBody, self.processRequestDetailResponse);					
				})
			} else {
				//
				this.showSnackBar('red', 'Invalid response received from the server!');
			}											
		},


		/**
		 * Method to handle the click event for the Cancel button
		 *
		 * @return (void)
		 */
		handlePartDetailCancelButton: function () {
			this.partOrderDetailDialog = false;
		},


		/**
		 * Method to process the Part Request detail response
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		processRequestDetailResponse: function (respObj) {

			this.log('processRequestDetailResponse() - BEGIN');
			this.log(respObj);			
			if (typeof respObj !== 'undefined' ) {

				if (respObj.count !== 0) {

					let self = this;					

					// process detail lines
					respObj.items.forEach(function (item) {
						self.partRequestLines.push({
							partNumber: item.fullname,
							desc: item.description,
							eta: item.expectedshipdate,
							orderedQuantity: item.quantity,
							pendingQuantity: item.transactionlinetype === 'RECEIVING' ? item.quantity : 0,
							transactionlinetype: item.transactionlinetype,
							lineNumber: item.id,
							detailId: item.id
						});
					});					
				} else {
					this.showSnackBar('red', 'Error: ' + respObj.result.message);
				}
				this.partOrderDetailDialog = true;
			}
			else {
				//
				this.showSnackBar('red', 'Invalid response received from the server!');
			}
			this.overlay = false;
			this.orderHeadersAreLoading = false;
		},




		/**
		 * Method to handle post message events sent between frames.  Member of VUE methods object.
		 *
		 * This method performs various functions related to data and messages being sent between frames (usually VUE components)
		 * on the page.  Examples are, applying the address or credit card information to the order.
		 *
		 * @param e (object) The postMessage() event object.
		 * @return (void)
		 */
		handleOfsPostMessage: function (e) {

			this.log('handleOfsPostMessage() - postMessage IN <--');

			var ofsData = JSON.parse(e.data);
			// Create a second object used for the console log (so we can mask any sensitive info).
			var ofsDataToLog = JSON.parse(e.data);

			ofsDataToLog.securedData.netsuiteUser = '<REMOVED>';
			ofsDataToLog.securedData.netsuitePassword = '<REMOVED>';



			this.log(ofsDataToLog);

			// Set required config values
			this.ofs.config.partRequestHeaderEndpoint.value = ofsData.securedData.partRequestHeaderEndpoint;
			this.ofs.config.partRequestDetailEndpoint.value = ofsData.securedData.partRequestDetailEndpoint;
			this.ofs.config.netsuiteUser.value = ofsData.securedData.netsuiteUser;
			this.ofs.config.netsuitePassword.value = ofsData.securedData.netsuitePassword;

			// Set properties from the Activity
			if (typeof ofsData.activity !== 'undefined')
			{
				this.ofs.props.callId.value = ofsData.activity.call_id;
			}

			// Set properties from the Resource
			this.ofs.props.technicianId.value = ofsData.resource.external_id;
			this.ofs.props.lob.value = ofsData.resource.burrough_resource_lob;


			this.initializePlugin();

		},


		initializePlugin: function () {
			this.log('initializePlugin() - BEGIN');

			this.getPartsRequestHeaders();


			// // Check the plugin configuration.  If it is valid initialize the plugin.
			// if (this.validatePluginConfiguration() === true) {

			// 	// Get the parts request headers
			// 	this.getPartsRequestHeaders();

			// } else {

			// 	this.showSnackBar('red', 'Some expected configuration values or properties are missing or invalid!  Check the plugin configuration and verify the necessary data elements in OFS are populated with data.', 10000);
			// }

		},

	},
};
</script>

<style>
.ship-icon {
	width: 50px;
	height: 30px;
}

th.text-left {
	text-align: left !important;
	border: 0px solid red;
}

th {
	text-align: left !important;
}
</style>
