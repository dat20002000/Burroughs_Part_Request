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

	<!-- Part Request Tracking Detail DIALOG -->
	<!-- <v-dialog v-model="trackingDetailDialog" max-width="700px">		
		<v-card>
			<v-toolbar short dense max-height="50" color="white" class="black--text">
				<v-btn icon :ripple="false" id="no-background-hover" style="cursor: default;">
					<img class="ship-icon" :src="itemIcon">
				</v-btn>
				<v-toolbar-title> 					
					Tracking ({{ trackingSO }}) 
				</v-toolbar-title>
				<v-spacer />
				<v-toolbar-items>
					<v-btn icon dark color="black" class="black--text" @click="handleTrackingtDetailCancelButton">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-toolbar-items>
			</v-toolbar>
			<v-divider />

			<v-data-table :headers="trackingHeaders" :items="trackingActivityItems" :hide-default-footer="true"></v-data-table>		
		</v-card>
	</v-dialog> -->

	<!-- Part Note DIALOG -->
	<v-dialog v-model="notesLogDialog" transition="dialog-bottom-transition" >		
		<v-card>
			<v-toolbar short dense max-height="50" color="white" class="black--text">				
				<v-toolbar-title> 					
					Notes Log
				</v-toolbar-title>
				<v-spacer />
				<v-toolbar-items>
					<v-btn icon dark color="black" class="black--text" @click="notesLogDialog = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-toolbar-items>
			</v-toolbar>
			<v-divider />			       
			<v-data-table :loading="notesLogResultsLoading" :headers="notesLogTableHeaders" :items="notesLogs" item-key="noteId">
                <template v-slot:[`item.date`]="{item}">
                      <span>{{ (new Date(item.date)).toLocaleString() }}</span>
                </template>        
              </v-data-table>
			  <v-spacer />
			<v-card-actions>
				<v-spacer />
				<v-btn color="red darken-4" class="white--text" @click="notesLogDialog = false">
					Dismiss
				</v-btn>
			</v-card-actions>            
        </v-card>

    </v-dialog>

	<!-- Part Request Note Submit DIALOG -->
	<v-dialog v-model="noteDialog" max-width="700px">		
		<v-card>
			<v-toolbar short dense max-height="50" color="white" class="black--text">				
				<v-toolbar-title> 					
					Note 
				</v-toolbar-title>
				<v-spacer />
				<v-toolbar-items>
					<v-btn icon dark color="black" class="black--text" @click="noteDialog = false; note.note = ''">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-toolbar-items>
			</v-toolbar>
			<v-divider />

			<v-form v-model="isFormValid" validate-on="submit lazy" @submit.prevent="handleSubmitNote" style="padding: 5px 30px 20px;">
			<v-text-field
				v-model="note.userName"
				label="User name"
				readonly
			></v-text-field>
			<v-text-field 
				v-model="note.date" 
				type="datetime-local" 
				label="Date/Time"
				readonly
			></v-text-field>
			<v-textarea 
				v-model="note.note"
				clearable
      			clear-icon="mdi-close-circle"
				no-resize
				:rules="[v => ((v || '' ).length <= 200 && (v || '' ).length > 0) || 'Note must be 200 characters or less']"
      			rows="3"
				label="Note">
			</v-textarea>

			<v-btn
				:loading="submitLoading"
				:disabled="!isFormValid"
				type="submit"
				block
				class="mt-2"
				color="primary"				
			>Submit</v-btn>
			</v-form>							
		</v-card>
	</v-dialog>

	<!-- Part Request Detail DIALOG -->
	<v-dialog v-model="partOrderDetailDialog" v-resize="onResize" scrollable max-width="700px" fullscreen transition="dialog-bottom-transition" hide-overlay>
		<!-- <v-overlay v-model="requestResultsTrackingLoading">
				<v-progress-circular indeterminate size="64" />
		</v-overlay> -->
		<v-card>
			<v-toolbar short dense max-height="50" color="white" class="black--text">
				<v-toolbar-title>Pending Orders Details ({{ selectedPartRequestId }}) </v-toolbar-title>
				<v-spacer />
				<v-toolbar-items>
					<v-btn icon dark color="black" class="black--text" @click="handlePartDetailCancelButton">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-toolbar-items>
			</v-toolbar>
			<v-divider />

			<v-data-table :headers="partRequestLineHeaders" :items="partRequestLines" :single-expand="singleExpand" :expanded.sync="expanded" item-key="detailId" show-expand :hide-default-header="isMobile" :class="{mobile: isMobile}">
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
					<tr v-if="item.transactionlinetype === 'INTRANSIT' && item.activityStatus !== 'completed' && !isMobile" style="background-color: #CCFFCC !important">
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
						<td>							
							<v-checkbox v-model="item.receivedInventory" v-bind:id="item.lineNumber" color="primary" style="pointer-events: none;"></v-checkbox>
						</td>
						<td>{{ item.consigned }}</td>
					</tr>
					
					<tr v-else-if="item.transactionlinetype === 'INTRANSIT' && item.activityStatus !== 'completed' && isMobile" style="background-color: #CCFFCC !important">
						<td>
							<ul class="flex-content" @click="expand(!isExpanded)">
								<li class="flex-item" data-label="Part Number">
									{{ item.partNumber }}
								</li>
								<li class="flex-item" data-label="Description">
									{{ item.desc }}
								</li>
								<li class="flex-item" data-label="Estimated ETA">
									{{ formatEtaDateString(item.eta) }}
								</li>
								<li class="flex-item" data-label="Ordered Quantity">
									{{ item.orderedQuantity }}
								</li>
								<li class="flex-item" data-label="Pending Quantity">
									{{ item.pendingQuantity }}
								</li>
								<li class="flex-item" data-label="Received Inventory">									
									<v-checkbox v-model="item.receivedInventory" v-bind:id="item.lineNumber" color="primary" style="pointer-events: none; margin: 0; padding: 0;"></v-checkbox>
								</li>
								<li class="flex-item" data-label="Consignment">
									{{ item.consigned }}
								</li>
								<li class="flex-item">
									<v-icon v-if="isExpanded" color="grey darken-3" dense>
										mdi-arrow-expand-up
									</v-icon>
									<v-icon v-else color="grey darken-3" dense>
										mdi-arrow-expand-down
									</v-icon>
								</li>
							</ul>
						</td>
					</tr>

					<!-- white -->
					<tr v-else-if="item.transactionlinetype === 'RECEIVING' && item.activityStatus !== 'completed' && !isMobile">
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
						<td>							
							<v-checkbox v-model="item.receivedInventory" v-bind:id="item.lineNumber" color="primary" style="pointer-events: none;"></v-checkbox>
						</td>
						<td>{{ item.consigned }}</td>
					</tr>

					<tr v-else-if="item.transactionlinetype === 'RECEIVING' && item.activityStatus !== 'completed' && isMobile" class="mobile">
						<td>
							<ul class="flex-content" @click="expand(!isExpanded)">								
								<li class="flex-item" data-label="Part Number">
									{{ item.partNumber }}
								</li>
								<li class="flex-item" data-label="Description">
									{{ item.desc }}
								</li>
								<li class="flex-item" data-label="Estimated ETA">
									{{ formatEtaDateString(item.eta) }}
								</li>
								<li class="flex-item" data-label="Ordered Quantity">
									{{ item.orderedQuantity }}
								</li>
								<li class="flex-item" data-label="Pending Quantity">
									{{ item.pendingQuantity }}
								</li>
								<li class="flex-item" data-label="Received Inventory">									
									<v-checkbox v-model="item.receivedInventory" v-bind:id="item.lineNumber" color="primary" style="pointer-events: none; margin: 0; padding: 0;"></v-checkbox>
								</li>
								<li class="flex-item" data-label="Consignment">
									{{ item.consigned }}
								</li>
								<li class="flex-item">
									<v-icon v-if="isExpanded" color="grey darken-3" dense>
										mdi-arrow-expand-up
									</v-icon>
									<v-icon v-else color="grey darken-3" dense>
										mdi-arrow-expand-down
									</v-icon>
								</li>								
							</ul>
						</td>
					</tr>

					<!-- red -->
					<tr v-else-if="item.activityStatus === 'completed' && !isMobile" style="background-color: #f72020 !important">
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
						<td>							
							<v-checkbox v-model="item.receivedInventory" v-bind:id="item.lineNumber" color="primary" style="pointer-events: none;"></v-checkbox>
						</td>
						<td>{{ item.consigned }}</td>
					</tr>

					<tr v-else-if="item.activityStatus === 'completed' && isMobile" style="background-color: #f72020 !important">
						<td>
							<ul class="flex-content" @click="expand(!isExpanded)">
								<li class="flex-item" data-label="Part Number">
									{{ item.partNumber }}
								</li>
								<li class="flex-item" data-label="Description">
									{{ item.desc }}
								</li>
								<li class="flex-item" data-label="Estimated ETA">
									{{ formatEtaDateString(item.eta) }}
								</li>
								<li class="flex-item" data-label="Ordered Quantity">
									{{ item.orderedQuantity }}
								</li>
								<li class="flex-item" data-label="Pending Quantity">
									{{ item.pendingQuantity }}
								</li>
								<li class="flex-item" data-label="Received Inventory">									
									<v-checkbox v-model="item.receivedInventory" v-bind:id="item.lineNumber" color="primary" style="pointer-events: none; margin: 0; padding: 0;"></v-checkbox>
								</li>
								<li class="flex-item" data-label="Consignment">
									{{ item.consigned }}
								</li>
								<li class="flex-item">
									<v-icon v-if="isExpanded" color="grey darken-3" dense>
										mdi-arrow-expand-up
									</v-icon>
									<v-icon v-else color="grey darken-3" dense>
										mdi-arrow-expand-down
									</v-icon>
								</li>
							</ul>
						</td>
					</tr>
				</template>

				<!-- END items template -->

				<!-- BEGIN expanded items template -->
				<template #expanded-item="{ headers, item}">
					<td v-if="!isMobile" :colspan="headers.length">
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
												Tracking Number
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
										<tr v-for="sitem in computedShipLines(item.lineNumber)" :key="sitem.id">
											<td>{{ sitem.soNumber }}</td>
											<td>{{ sitem.shipQuantity }}</td>
											<td>{{ formatEtaDateString(sitem.eta) }}</td>
											<td>{{ sitem.trackingNumber }}</td>
											<td>
												<img class="ship-icon" :src="sitem.icon">
											</td>
											<td>
												<v-btn small color="grey darken-3" class="white--text" :disabled="typeof sitem.trackingURL === 'undefined' || sitem.trackingURL === null || sitem.trackingURL.length === 0 || typeof sitem.trackingNumber === 'undefined' || sitem.trackingNumber === null || sitem.trackingNumber.length === 0" @click="handleTrackButtonClick(sitem)">
													Track
												</v-btn>
												<!-- <v-btn small color="grey darken-3" class="white--text" @click="handleTrackButtonClick(sitem)">
													Track
												</v-btn> -->
											</td>
										</tr>
									</tbody>
								</template>
							</v-simple-table>
						</template>
					</td>
					<tr v-else class="mobile" style="background: #eeeeee !important">
						<td>
							<ul v-for="sitem in computedShipLines(item.lineNumber)" :key="sitem.id" class="flex-content">
								<li class="flex-item" data-label="SO#">
									{{ sitem.soNumber }}
								</li>
								<li class="flex-item" data-label="Ship Quantity">
									{{ sitem.shipQuantity }}
								</li>
								<li class="flex-item" data-label="Actual ETA">
									{{ formatEtaDateString(sitem.eta) }}
								</li>
								<li class="flex-item" data-label="Tracking Number">
									{{ sitem.trackingNumber }}
								</li>
								<li class="flex-item" data-label="Carrier">
									<img class="ship-icon" :src="sitem.icon">
								</li>
								<li class="flex-item">
									<v-btn small color="grey darken-3" class="white--text" :disabled="typeof sitem.trackingURL === 'undefined' || sitem.trackingURL === null || sitem.trackingURL.length === 0 || typeof sitem.trackingNumber === 'undefined' || sitem.trackingNumber === null || sitem.trackingNumber.length === 0" @click="handleTrackButtonClick(sitem)">
										Track
									</v-btn>
								</li>
							</ul>
						</td>
					</tr>
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
		<v-container v-if="isVerify" fluid>
			<!-- <v-overlay v-model="notesLogResultsLoading">
				<v-progress-circular indeterminate size="64" />
			</v-overlay> -->

			<v-row>
				<v-col cols="2" />
				<v-col cols="2" />
				<v-col cols="6" sm="8" md="4" />
			</v-row>
			<v-row>
				<v-col>
					<v-row>
						<v-col :cols="isMobile ? 12 : 6">
							<v-text-field v-model="partRequestSearchQuery" clearable prepend-inner-icon="mdi-filter" outlined hint="Examples: 9876543, Smith, pre-approval" persistent-hint label="Filter Results by Keyword" />
						</v-col>
						<v-col :cols="6">
							<v-btn @click="openNotesLogDialog">
								<v-icon color="grey">mdi-post</v-icon> 
									Notes Log
							</v-btn> 
						</v-col>
					</v-row>
					<v-data-table :loading="requestResultsLoading" :headers="PartRequestHeaders" :items="partRequestHeaderItems" :search="partRequestSearchQuery" item-key="requestId" height="600px">
						<template #[`item.status`]="{ item }">
							<v-chip v-if="item.status.includes('Pending Receipt')" color="green" dark label>
								{{ item.status }}
							</v-chip>
							<v-chip v-else color="red" dark label>
								{{ item.status }}
							</v-chip>
						</template>
						<template #[`item.actions`]="{ item }">
							<v-row v-if="isMobile">
								<v-col cols="6">
									<v-btn small color="grey darken-3" class="white--text" @click="handleOrderDetailsButtonClick(item)">
										Details
									</v-btn>
								</v-col>							
								<v-col v-if="item.status.includes('Pending Receipt')" cols="6">
									<v-btn small color="grey darken-3" class="white--text" @click="handleAddNoteButtonClick(item)">
										Note
									</v-btn>
								</v-col>
							</v-row>
							<v-row v-if="isMobile">
								<v-col cols="1"></v-col>
								<v-col v-if="item.status.includes('Pending Receipt')" cols="9">
									<v-btn small color="grey darken-3" class="white--text" @click="handlePartReceivedRedirectButtonClick(item)">
										Part Received
									</v-btn>
								</v-col>
							</v-row>
							<v-row v-else-if="!isMobile"> 
								<v-col cols="auto">
									<v-btn small color="grey darken-3" class="white--text" @click="handleOrderDetailsButtonClick(item)">
										Details
									</v-btn>
								</v-col>							
								<v-col v-if="item.status.includes('Pending Receipt')" cols="auto">
									<v-btn small color="grey darken-3" class="white--text" @click="handleAddNoteButtonClick(item)">
										Note
									</v-btn>
								</v-col>								
								<v-col v-if="item.status.includes('Pending Receipt')" cols="auto">
									<v-btn small color="grey darken-3" class="white--text" @click="handlePartReceivedRedirectButtonClick(item)">
										Part Received
									</v-btn>
								</v-col>
							</v-row>
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
import { db } from './db';
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
				},
				partRequestTrackingDetailEndpoint: {
					description: 'Endpoint used to retrieve Part Request tracking information',
					value: null,
					required: true
				},
				ofscClientId: {
					description: 'Client ID for OFS REST API',
					value: null,
					required: true          
				},
				ofscClientSecret: {
					description: 'Client Secret for OFS REST API',
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
				orderNumber: {
					description: 'The Burrough Order Number (Activity Order Number)',
					value: null,
					required: false
				},
				activityStatus: {
					description: 'The Burrough Status (Activity Status)',
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
				},
				customer: {
					description: 'The Burrough Customer',
					value: null,
					required: false
				},
				techExternalId: {
					description: 'OFS External ID of the resource',
					value: null,
					required: true            
				}
			}
		},

		overlay: false,
		SERVICE_WORKER_ENABLED: true,

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
				text: 'Shipping Address',
				value: 'shipAddress'
			},
			{
				text: 'Ship Method',
				value: 'shipMethod'
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
				text: 'Warehouse:',
				value: 'whCode'
			},
			{
				text: 'Action',
				value: 'actions'
			}
		],

		partRequestHeaderItems: [],

		requestBody: {
			payload: {}
		},
		requestBody2: {
			payload: {}
		},
		

		icon: "",
		trackingURL: "",
		UPSToken: "",
		trackingSO: "",
		itemIcon: "",

		isOnline: navigator.onLine,

		isVerify: false,
		isFormValid: false,
		
		requestResultsLoading: true,
		notesLogResultsLoading: false,
		partRequestSearchQuery: "",
		partOrderDetailDialog: false,
		orderDetailsAreLoading: false,
		selectedPartRequestId: null,
		// trackingDetailDialog: false,
		noteDialog: false,
		// requestResultsTrackingLoading: false,
		submitLoading: false,
		notesLogDialog: false,

		APIcall: 'firstcall',

		note:{
			userName: '',
			date: '',
			note: ''
		},


		singleExpand: false,
		isMobile: false,

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
			},
			{
				text: 'Received Inventory',
				value: 'receivedInventory'
			},
			{
				text: 'Consignment',
				value: 'consigned'
			}
		],


		// Array for Part Request detail lines
		partRequestLines: [],

		// Part Request ship lines
		shipLines: [],

		trackingHeaders: [
			{
				text: 'Date-Time',				
				value: 'date',
				sortable: false
			},
			{
				text: 'Location',
				value: 'location',
				sortable: false
			}
		],

		//Array for Tracking items
		trackingActivityItems: [],

		tempList: [],

		notesLogTableHeaders: [
			{
				text: "Time",
				value: "date"
			},
			{
				text: "User",
				value: "userName"
			},
			{
				text: "Log",
				value: "note"
			},            
		],

		notesLogs: [],


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

		this.initializeServiceWorker();

		// Handle the browser going offline
		window.addEventListener("offline", this.browserOffline);

		// Handle the browser going online
		window.addEventListener("online", this.browserOnline);

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
			
			// this.ofs.config.partRequestHeaderEndpoint.value = 'https://ofsproxy2.burroughs.com:5000/proxy/netsuite/services/rest/query/v1/suiteql';
			// this.ofs.config.partRequestDetailEndpoint.value = 'https://ofsproxy2.burroughs.com:5000/proxy/netsuite/services/rest/query/v1/suiteql';
			/*
			this.ofs.config.netsuiteUser.value = ''; // <-- Delete after any localhost development or testing!
			this.ofs.config.netsuitePassword.value = ''; // <-- Delete after any localhost development or testing!
			this.ofs.props.lob.value = 'PPS-LFS';
			this.ofs.props.callId.value = '12345';
			this.ofs.props.technicianId.value = 'K04072';
			*/

			// QA
			this.ofs.config.partRequestHeaderEndpoint.value = 'https://ofstest2.burroughs.com:5000/proxy/netsuite/services/rest/query/v1/suiteql';
			this.ofs.config.partRequestDetailEndpoint.value = 'https://ofstest2.burroughs.com:5000/proxy/netsuite/services/rest/query/v1/suiteql';
			this.ofs.config.partRequestTrackingDetailEndpoint.value = 'https://ofstest2.burroughs.com:5000/proxy/servicepro/trackingnumber';
			this.ofsParentOrigin = 'https://burroughsofs1.test.fs.ocs.oraclecloud.com'
			this.ofs.config.netsuiteUser.value = 'speridian.ofs.plugin'; // <-- Delete after any localhost development or testing!
			this.ofs.config.netsuitePassword.value = 'Hairplugs90*5'; // <-- Delete after any localhost development or testing!
			this.ofs.config.ofscClientId.value = "plugin@burroughsofs1.test"
      		this.ofs.config.ofscClientSecret.value = "06f8fff6257ceccdd85794171fd7b4e3e036aacb2c5c15a2552c23a7ecaf"
			this.ofs.props.lob.value = 'PPS-LFS';
			this.ofs.props.callId.value = '12345';
			this.ofs.props.technicianId.value = '005068';
			this.note.userName = 'abc';
			this.isVerify = true;
			
			//init plugin
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
			var computedShipLines = this.shipLines.filter(result => result.lineNumber === lineNumber);			
			return computedShipLines;
		},


		/*Switch Mobile Mode*/
		onResize() {
		  this.log(this.isMobile);
			if (window.innerWidth < 769)
				this.isMobile = true;
			else
				this.isMobile = false;
		},

		/*Online/Offline Toggle*/
		browserOffline(e) {
			this.isOnline = false;
			this.log("offline" + e);
			this.showSnackBar("orange", "App goes offline")
		},
		browserOnline(e) {
			this.isOnline = true;
			this.log("online" + e);
			this.showSnackBar("green", "App goes online")
		},

		/**
		 * Method used to retrieve Part Request header information.
		 *
		 * @return (void)
		 */
		getDepotManager: function () {

		this.log('getDepotManager() - BEGIN');

		// PROD
		this.requestBody.payload= {
				"q" : "SELECT custrecord_depot_access,custrecord_depot_manager,name, id, mainaddress from location where name = '"+ this.ofs.props.technicianId.value +"'"
		}

		//TEST
		// this.requestBody.payload= {
		// 	"q" : "SELECT custrecord_depot_access,custrecord_depot_manager,name, id, mainaddress from location where name = 'TX04-S007'"
		// }					

		if (this.isOnline) {
		// Get the part request headers
			this.makeApiRequest('POST', this.ofs.config.partRequestHeaderEndpoint.value, this.ofs.config.netsuiteUser.value, this.ofs.config.netsuitePassword.value, this.requestBody, this.getPartsRequestHeaders);
		}
		else {
			this.loadDataFromIndexDBAndPopulateData();
		}

		},

		/**
		 * Method used to retrieve Part Request header information.
		 *
		 * @return (void)
		 */
		async getPartsRequestHeaders (respObj) {

			this.log('getPartsRequestHeaders() - BEGIN');
			this.log("reponse data:" + respObj);
			let locationID = null;

			respObj.json((json) => {return json}).then(async (respItems) => {
				if(typeof respItems !== 'undefined' && 'items' in respItems){
					if (respItems.count !== 0) {
						respItems.items.forEach(function (item) {
							if (item.custrecord_depot_manager === 'T'){
								locationID = item.custrecord_depot_access;
							}
						})
					} else {
						this.showSnackBar('orange', 'GET Depot Manager: no data found');
					}

					//PROD
					this.requestBody.payload= {
						"q": "SELECT DISTINCT TRANSACTION.recordtype,TRANSACTION.id,TRANSACTION.tranid,transactionline.transactionlinetype, fromlocation.name AS warehouse_ship_location_id,fromlocation.custrecord_location_description AS Warehouse_ship_location,CUSTOMLIST_BI_LOCATION_TYPES.name AS warehouse_location_Type,locationmainaddress.addrtext AS warehouse_address FROM TRANSACTION LEFT JOIN location ON location.id = TRANSACTION.transferlocation INNER JOIN transactionline ON transactionline.TRANSACTION = TRANSACTION.id INNER JOIN Location AS fromlocation ON fromlocation.id = transactionline.location LEFT JOIN CUSTOMLIST_BI_LOCATION_TYPES ON CUSTOMLIST_BI_LOCATION_TYPES.id = fromlocation.custrecord_bi_location_type LEFT JOIN locationmainaddress ON fromlocation.mainaddress = locationmainaddress.nkey INNER JOIN item ON transactionline.item = item.id WHERE TRANSACTION.recordtype IN (NULL,'transferorder','purchaseorder') AND (transactionline.transactionlinetype ='SHIPPING' OR transactionline.transactionlinetype IS NULL) AND (location.name = '"+ this.ofs.props.technicianId.value +"' OR location.id IN ("+ locationID +") OR TRANSACTION.custbody_bi_call_number LIKE '"+ this.ofs.props.orderNumber.value +"%')"
					}
					this.requestBody2.payload= {
						"q": "SELECT Distinct TRANSACTION.shipcarrier, TRANSACTION.shipdate,TRANSACTION.status,TRANSACTION.custbody_bi_call_number, transactionline.quantity as ordered_qty,(transactionline.quantity - transactionline.quantityshiprecv) as pending_qty ,TRANSACTION.custbody_bi_track_num,TRANSACTION.recordtype,transactionstatus.name as Ship_status,TRANSACTION.id,transaction.transferlocation,TRANSACTION.tranid,transactionline.quantity,transactionline.expectedshipdate, transactionline.item,transactionline.transactionlinetype, item.fullname,CUSTOMLIST_BI_LOCATION_TYPES.name as tech_type, location.custrecord_location_description as Tech_name, item.custitem_is_consigned, item.description, transactionshippingaddress.addrtext as ship_to_address,location.name AS Tech_Location_Id,shipitem.itemid AS ship_method FROM TRANSACTION LEFT JOIN location ON location.id = TRANSACTION.transferlocation INNER JOIN transactionshippingaddress ON TRANSACTION.shippingaddress = transactionshippingaddress.nkey INNER JOIN transactionline ON transactionline.TRANSACTION = TRANSACTION.id  INNER JOIN shipitem ON transactionline.shipmethod = shipitem.id LEFT JOIN item ON transactionline.item = item.id LEFT JOIN CUSTOMLIST_BI_LOCATION_TYPES ON CUSTOMLIST_BI_LOCATION_TYPES.id = location.custrecord_bi_location_type left join transactionstatus on transaction.type = transactionstatus.trantype AND transaction.status = transactionstatus.id WHERE TRANSACTION.recordtype IN (NULL,'transferorder','purchaseorder') AND transactionstatus.name in ('Pending Receipt','Pending Fulfillment','Pending Billing/Partially Received','Pending Supervisor Approval') AND transactionline.quantity > 0 AND (transactionline.transactionlinetype = 'RECEIVING' OR transactionline.transactionlinetype is null) AND (location.name = '"+ this.ofs.props.technicianId.value +"' OR location.id IN ("+ locationID +") OR TRANSACTION.custbody_bi_call_number LIKE '"+ this.ofs.props.orderNumber.value +"%')"
							 
					}	

					//TEST
					// this.requestBody.payload= {
					// 	"q": "SELECT DISTINCT TRANSACTION.recordtype,TRANSACTION.id,TRANSACTION.tranid,transactionline.transactionlinetype, fromlocation.name AS warehouse_ship_location_id,fromlocation.custrecord_location_description AS Warehouse_ship_location,CUSTOMLIST_BI_LOCATION_TYPES.name AS warehouse_location_Type,locationmainaddress.addrtext AS warehouse_address FROM TRANSACTION LEFT JOIN location ON location.id = TRANSACTION.transferlocation INNER JOIN transactionline ON transactionline.TRANSACTION = TRANSACTION.id INNER JOIN Location AS fromlocation ON fromlocation.id = transactionline.location LEFT JOIN CUSTOMLIST_BI_LOCATION_TYPES ON CUSTOMLIST_BI_LOCATION_TYPES.id = fromlocation.custrecord_bi_location_type LEFT JOIN locationmainaddress ON fromlocation.mainaddress = locationmainaddress.nkey INNER JOIN item ON transactionline.item = item.id WHERE TRANSACTION.recordtype IN (NULL,'transferorder','purchaseorder')AND transactionline.transactionlinetype ='SHIPPING' AND (location.name = 'TX04-S007' or location.id IN ('2104','2115') OR TRANSACTION.custbody_bi_call_number LIKE 'null%')"
					// }	
					// this.requestBody2.payload= {
					// 	"q": "SELECT TRANSACTION.shipcarrier, TRANSACTION.shipdate,TRANSACTION.status,TRANSACTION.custbody_bi_call_number,TRANSACTION.custbody_bi_track_num,transactionstatus.name as Ship_status,transactionline.quantity as ordered_qty,(transactionline.quantity - transactionline.quantityshiprecv) as pending_qty,TRANSACTION.recordtype,TRANSACTION.id,transaction.transferlocation,TRANSACTION.tranid,transactionline.quantity,transactionline.expectedshipdate, transactionline.item,transactionline.transactionlinetype, item.fullname,CUSTOMLIST_BI_LOCATION_TYPES.name as tech_type, location.custrecord_location_description as Tech_name, item.custitem_is_consigned, item.description, transactionshippingaddress.addrtext as ship_to_address,location.name AS Tech_Location_Id,shipitem.itemid AS ship_method FROM TRANSACTION INNER JOIN location ON location.id = TRANSACTION.transferlocation INNER JOIN transactionshippingaddress ON TRANSACTION.shippingaddress = transactionshippingaddress.nkey INNER JOIN transactionline ON transactionline.TRANSACTION = TRANSACTION.id  INNER JOIN shipitem ON transactionline.shipmethod = shipitem.id LEFT JOIN item ON transactionline.item = item.id LEFT JOIN CUSTOMLIST_BI_LOCATION_TYPES ON CUSTOMLIST_BI_LOCATION_TYPES.id = location.custrecord_bi_location_type left join transactionstatus on transaction.type = transactionstatus.trantype AND transaction.status = transactionstatus.id WHERE TRANSACTION.recordtype IN (NULL,'transferorder','purchaseorder')AND transactionline.transactionlinetype = 'RECEIVING' AND (location.name = 'TX04-S007' OR location.id IN ('2104','2115') OR TRANSACTION.custbody_bi_call_number LIKE 'null%')"
					// }	

					
					if (this.isOnline) {
					// Get the part request headers
						this.APIcall = 'firstcall';		
						this.makeApiRequest('POST', this.ofs.config.partRequestHeaderEndpoint.value, this.ofs.config.netsuiteUser.value, this.ofs.config.netsuitePassword.value, this.requestBody, this.processPartRequestHeaderResponse);										
					}
					else {
						this.loadDataFromIndexDBAndPopulateData();
					}
				}
			}).catch( (err) =>{
				this.showSnackBar('red', err);
			});			

		},

		/**
		 * Method to process the Tracking Token response.
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		// async processGetUPSTokenResponse(respObj) {

		// this.log('processGetUPSTokenResponse() - BEGIN');
		// this.log("reponse data:" + respObj);

		// respObj.json((json) => {
		// 	return json;
		// }).then(async (decode) => {
		// 	if(typeof decode !=='undefined'){
		// 		this.log(decode);
		// 		this.UPSToken = decode;
		// 		this.makeApiRequest('GET','https://wwwcie.ups.com/api/track/v1/details/'+ tranid +'?locale=en_US&returnSignature=false', null, null , tranid, this.processGetUPSDataResponse, null, this.UPSToken);
		// 	}else {
		// 		this.showSnackBar('orange', 'GET Part Request Headers: no data found');
		// 	}
		// }).catch( (err) =>{
		// 	this.showSnackBar('red', err);
		// });		

		// },


		/**
		 * Method to process the Part Tracking response.
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		// async processGetUPSDataResponse(respObj) {
		// 	this.log('processGetUPSDataResponse() - BEGIN');
		// 	this.log("reponse data:" + respObj);
		// 	let self = this;			
			
		// 	self.trackingActivityItems.length = 0;	

		// 	respObj.json((json) => {return json}).then(async (item) => {
		// 		if(typeof item !== 'undefined'){					
		// 			self.trackingActivityItems.push({						
		// 				date: item.deliveredDate,
		// 				location: item.partLocation,
		// 				desc: "Shipper created a label, UPS has not received the package yet."
		// 			})
					
		// 			this.requestResultsTrackingLoading = false;
		// 			this.trackingDetailDialog = true;
		// 		}
		// 	}).catch( (err) =>{
		// 		this.showSnackBar('red', err);
		// 	});			
		// },


		/**
		 * Method to process the Part Request header response.
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		async processPartRequestHeaderResponse(respObj) {

			this.log('processPartRequestHeaderResponse() - BEGIN');			

			respObj.json((json) => {
				return json;
			}).then(async (decode) => {
				if('items' in decode){
				if (decode.count !== 0) {					
					let self = this;	
					let newDistinctList = null;				
					if (typeof decode.items !== 'undefined')
					{														
						if(self.APIcall === 'firstcall'){						

						//Remove Dupplicate tranid
						newDistinctList = decode.items.filter((value, index, self) =>
							index === self.findIndex((t) => (
							t.tranid === value.tranid
						)));						

						//Add to PartRequest List
						newDistinctList.forEach(function (item) {
							self.tempList.push({
								requestId : item.tranid,
								status : '',
								customer : self.ofs.props.customer.value,
								shipAddress: item.warehouse_address.replace(/(\r\n|\n|\r)/gm," "),
								shipMethod: '',
								callId : '',
								dateShipped : '',
								whCode: item.warehouse_ship_location,
								partOrderNumber: ''
							});
						});

						//Make second call
						self.APIcall = 'secondcall';
						this.makeApiRequest('POST', this.ofs.config.partRequestHeaderEndpoint.value, this.ofs.config.netsuiteUser.value, this.ofs.config.netsuitePassword.value, this.requestBody2, this.processPartRequestHeaderResponse);														
						} else if ( self.APIcall === 'secondcall' ) {	

							//Remove Dupplicate tranid
							newDistinctList = decode.items.filter((value, index, self) =>
								index === self.findIndex((t) => (
								t.tranid === value.tranid
							)));


							newDistinctList.forEach(function (item) {
								
								if(self.tempList.find(value => value.requestId === item.tranid) !== 'undefined'){
									self.tempList.find(value => value.requestId === item.tranid).status = item.ship_status;
									self.tempList.find(value => value.requestId === item.tranid).callId = item.custbody_bi_call_number;
									self.tempList.find(value => value.requestId === item.tranid).dateShipped = item.shipdate;
									self.tempList.find(value => value.requestId === item.tranid).shipMethod = item.ship_method;
									self.tempList.find(value => value.requestId === item.tranid).partOrderNumber = item.id;

									if(item.ship_method.indexOf('Pickup (Will Call)') < 0){
										self.tempList.find(value => value.requestId === item.tranid).shipAddress = item.ship_to_address.replace(/(\r\n|\n|\r)/gm," ");
									}
								}
							});
							
							//Filter status
							self.tempList = self.tempList.filter(v => (v.status === 'Pending Receipt' || v.status === 'Pending Fulfillment' || v.status === 'Pending Billing/Partially Received' || v.status === 'Pending Supervisor Approval'));							
							
							self.partRequestHeaderItems = self.tempList;
							// self.tempList.length = 0;

							await db.partRequest.clear();					
							await db.partRequest.bulkPut(self.partRequestHeaderItems);
							await db.part.clear();
							await db.part.bulkPut(decode.items);
							self.APIcall = 'firstcall';
							this.requestResultsLoading = false;
						}				
					}					
					this.log("ONLINE - DATA ADD TO DB SUCESS");
				}
				}else {
					this.showSnackBar('orange', 'GET Part Request Headers: no data found');
				}
			}).catch( (err) =>{
				this.showSnackBar('red', err);
			});			
		},

		/**
		 * Method to handle load offline data
		 *		
		 * @return (void)
		 */

		async loadDataFromIndexDBAndPopulateData(){
			this.log("IN OFFLINE"); 
			let localpartRequest = await db.partRequest.toArray();
			if(localpartRequest.length > 0){
			this.partRequestHeaderItems = localpartRequest;
				this.log(localpartRequest);
				this.showSnackBar('green', 'Part Request data loaded from offline data store.', 3000);
			} else {
			this.showSnackBar('red', 'Offline data not available', 3000);   			  
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

			// let endpointAuth = 'bHVYUXhjM1ZZOHVGN2NJOFVvczFmMHNtS2RBTjQ2MHRDcjJDMlRHR2lBd2hoRTMxOlViNmhSVkNWNVF2WGlLb0lHR2ZuaUlGUjQ2RDJkTUtXU25kTTNWQ3RpV252M0UwVnkzaFpJZWxHOUZmSGlDdEc=';

			
			if (this.runningWithinOfs === true) {

				let trackingURL = item.trackingURL.replace(/&amp;/g, '&');

				var msg = {
					apiVersion: 1,
					method: "callProcedure",
					procedure: "openLink",
					callId: item.soNumber ? item.soNumber : item.itemID,
					params: {
						url: trackingURL
					}
				}

				this.postMessage(msg, this.ofsParentOrigin);

				// this.trackingSO = item.soNumber;
				// this.itemIcon = item.icon;
				// this.requestResultsTrackingLoading = true;

				//PROD
				// this.requestBody.payload = {"trackingNumber": item.trackingNumber, "appointmentId": item.soNumber, "orderId": this.ofs.props.orderNumber.value, "provider":"FedEx", "etaUpdateDate":""}

				//TEST
				// this.requestBody.payload = {"trackingNumber":"782917401544","appointmentId":"37789","orderId":"35802","provider":"FedEx","etaUpdateDate":""}
				
				// this.makeApiRequest('POST',this.ofs.config.partRequestTrackingDetailEndpoint.value, this.ofs.config.netsuiteUser.value, this.ofs.config.netsuitePassword.value, this.requestBody, this.processGetUPSDataResponse);	
																

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
		 * Method to handle the click event for the Track button 
		 *  
		 * @return (void)
		 */
		handlePartReceivedRedirectButtonClick: function (item) {
			this.log('handlePartReceivedRedirectButtonClick()');

			var msg = {
					apiVersion: 1,
					method: "close",
					entity: "activity",
					backScreen: "plugin_by_label",
   					backPluginLabel: "part-recieve-poc",					
					backPluginOpenParams: {
						techinvsiteid: this.ofs.props.technicianId.value,
						callId: this.ofs.props.callId.value,
						custbody_bi_call_number: item.callId,
						tranid: item.partOrderNumber
					}
				}

			this.postMessage(msg, this.ofsParentOrigin);
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
			
			this.processRequestPartNumberResponse(item.requestId)

		},

		/**
		 * Method to process the Part Request Number response
		 *
		 * @param respObj (object) The response object.
		 * @return (void)
		 */
		async processRequestPartNumberResponse(respObj) {
			this.log('processRequestPartNumberResponse() - BEGIN');		
			
			// this.itemTranid = respObj;

			let listShipline = await db.part.where('tranid').equalsIgnoreCase(respObj).toArray();
			let self = this;			
			let listpartID = [];	
			let tempList = [];					
				
			//Clear arrays
			self.shipLines.length = 0;

			// Clear line arrays
			self.partRequestLines.length = 0;
						

			//Process ship lines
			if (listShipline.length > 0) {
				listShipline.forEach((item, index) => {			

				listpartID.push(item.item);

				self.log(item);

					if (item.ship_method.includes('UPS'))
					{
						self.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAMAAABA3o1rAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABxVBMVEUAAAD/tQD/3wBsRg9pQxD1rgH0rgH/vgD//wD/vwD/4gD/5AD/3gD/4AD/tQD/tQD/tQD/tQD/tQD/tgD/twD/uAD/uQD/uQD/uwD/xgD/4gD/tAD/tQD/tQD/tgCgbQqjbwrXlwT//wD/tAD/tQC7ggf//wD/vwD9tAC7gQfNjwW5gAe8gwe9gwf//wC8gge+hAfUlATSkwX/tgCYZwuWZgv/tgDppwKdawqbaQropgL8uwDOkAWOXwyNXwzMjgX7ugD/8wD6uQDUlAXTkwX6uQH/9wD/twD2rwHdmwTAhgasdgmibwrtqAKrdglpRBBGKRM4HhU0GxUzGhUyGhVBJRTGigZhPRAzGxUwGBYxGRVAJBR6UA5LLRNgPBFYNhF5Tw6AVQ1QMBKGWQ1pQxC/hAd/VA2yewjSkwWyegitdwm4fwepdAl5UA7BhgazewiweQi9gwdfPBHPkgW7ggdYNxHBhwZiPhDMjwVUNBKqdQm5gAeocwnEiAbTlAWncwnXlwS8ggeFWA22fQhmQRBxSg91TA7WlgR8Ug5EJxN7UQ4tFhbChwY5HxU3HhVTMhJKLBNrRQ82HRU1HBVTMxJVNBL///+8D3TlAAAAR3RSTlMAAAAAAAAAAAAAAAAAAAMHJV2Nqra2qo1dJQMBdOT9/eR0AQOsrAMDrKysrKysAqiog4My4uExVt7dViuU5+aSKgMvh4cvA1HegzoAAAABYktHRJaRaSs5AAAACXBIWXMAAD7+AAA+/gGZa7RrAAAAB3RJTUUH5AscDRM1E5o84AAAAPNJREFUKM9jYEACjIx8/Px8jIwMWAEjn4CgkLCIqJi4hKQUExZ5aRlZOXcPTy9vH3kFRSVMUxiVVdx9/fwDAoOCQ0JV1bAoUNcIC4+IjIoKCoqK1sSmQE0rJjYuPiExICk5RRurAp3UtHS/jMys7Jxc7Cbo5iXmFxQWFZekl2I3QbcsMb2gsLyisqpaB5sCPf2a2rr6hsb6puxmAz0sCpgNWxJa29o7OsO7UoxYsIQmq7FJYLd/T29QVJ+pGRuWoGbnMLfonzBx0uQpllYcnNgig0vJ2sZ2ylQ7ewclbuzRxcDj6OTs4urGy4AbcCgpcaCKAAAd3TdNGmVs3wAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0xMS0yOFQxMzoxOTo1MyswMDowMH1gvy8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMTEtMjhUMTM6MTk6NTMrMDA6MDAMPQeTAAAAIHRFWHRzb2Z0d2FyZQBodHRwczovL2ltYWdlbWFnaWNrLm9yZ7zPHZ0AAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW1iOjpJbWFnZTo6SGVpZ2h0ADI1NunDRBkAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANTEyHHwD3AAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNjA2NTY5NTkzjVpJ2AAAABN0RVh0VGh1bWI6OlNpemUAMTAyNzdCQvdBGbcAAABEdEVYdFRodW1iOjpVUkkAZmlsZTovLy4vdXBsb2Fkcy81Ni9CT0RDSjlxLzI2OTkvdXBzX2xvZ29faWNvbl8xNjc3MTYucG5nwbt9mAAAAABJRU5ErkJggg==';
						self.trackingURL = 'https://www.ups.com/track?loc=en_US&tracknum='
					}
					else if (item.ship_method.includes('Fed'))
					{
						self.icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAMAAABA3o1rAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACDVBMVEUAAABDM45CM47VZSxDM41EM49DM45DM45DM45DM45DM45CM49ON4e8XT3XZivVZSzVZSxDM45DM45DM45DM45DM45DM45DM45CM49ON4e8XT3XZivVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45CM4+8XT3XZivVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45DM45DM45CM4/XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45DM45CM45ON4e8XT3XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45CM4/XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45CM4/XZivVZSzVZSzVZSzVZSzVZSzVZSxDM45DNI5DM45DM45DM45DM45CM47XZivVZSzVZSzVZSzVZSzVZSzVZSxDM45DM45DM45DM45DM45DM45DM45DM45DM45DM45CM49ON4e8XT3XZivVZSzVZSzVZSzVZSzVZSzVZSzVZSxEM49DM45DM45DM45DM45DM5BPN4i9XT3XZivVZSxON4e9XTxDM468XTzVZSz////OBluuAAAAqXRSTlMAAAAAAAACFRoZDxEaGRkZCRK33d7igQOU3djb3t1NFtb8wbVorf7xubI+9GI8HTp0Zh8qalq52ks9MzsqAhw8KAHV9/O85MLXw1Ly9f79/fbyhcziZ73mUviRg+nxmPppLtjlgHZI5fr0bwPvLeybn9pBCMPTLR0Uw+Qy8AGagpOx8/vpXpb5xSIOjZ6W1MtuFIC6l6inqaqnoxhwrF0CBBMBDAECAgIEDWEfDgAAAAFiS0dErrlrk6cAAAAJcEhZcwAAPv4AAD7+AZlrtGsAAAAHdElNRQfkCxwNMgYg1UgVAAABG0lEQVQoz2NgoANgZGPn4OTgYmQEc5i4eXj5+PkFmJEUCAoJi4iKMbKAOeISklLSMrJyyArkFRSVlFVgClRXqqlraGohK2BX0NbR1dM3MDRiNDYxNVu5ytzC0sraxtbO3sGRGazAabWzi6ubu4enl5O3iI+vn39AYFBwSGhYeAQzRIFCZFR0TGyckGJMfEJi0so1ySmpDmnpGZlZ2cxQK3JyBRXy8uMKCp2LiktWriotKxeoqFxbVc0MUSDvUZNYWxdb39AYFamU3+Tr19yS3trW3pFZ2Qmxoqu7x4hRr7evf8LESQqTp0ydNn3GzNRZQbPnzJ0HdiQr6/z5rKyMCxZ2LWIUX7h4ydJly21tV9g6MjvaZjMzM9ABAABFGkn5FEBvdgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0xMS0yOFQxMzo1MDowNiswMDowMCt0xqQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMTEtMjhUMTM6NTA6MDYrMDA6MDBaKX4YAAAAIHRFWHRzb2Z0d2FyZQBodHRwczovL2ltYWdlbWFnaWNrLm9yZ7zPHZ0AAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW1iOjpJbWFnZTo6SGVpZ2h0ADI1NunDRBkAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANTEyHHwD3AAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNjA2NTcxNDA21eRtdgAAABJ0RVh0VGh1bWI6OlNpemUAODc2OEJCb31K8QAAAEZ0RVh0VGh1bWI6OlVSSQBmaWxlOi8vLi91cGxvYWRzLzU2L0JPRENKOXEvMjY5OS9mZWRleF9sb2dvX2ljb25fMTcxMTYxLnBuZ7ndHQ0AAAAASUVORK5CYII=';
						self.trackingURL = 'https://www.fedex.com/fedextrack/?trknbr='
					}

					tempList.push({
						icon : self.icon,
						trackingURL : self.trackingURL.concat(item.custbody_bi_track_num),
						trackingNumber: item.custbody_bi_track_num,
						eta: item.expectedshipdate,
						shipQuantity: item.quantity,
						soNumber: item.custbody_bi_call_number,								
						lineNumber: item.item,
						itemID: index + 'abc'
					});							
				});

				self.shipLines = tempList;		

				//Loop each partID
				listpartID.forEach(function (partID){
					self.processRequestDetailResponse(partID, respObj);
				});

			} else {
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
		 * Method to handle the click event for the Cancel button
		 *
		 * @return (void)
		 */
		handleTrackingtDetailCancelButton: function () {
			this.trackingDetailDialog = false;						
		},


		/**
		 * Method to process the Part Request detail response
		 *
		 * @param partID (id).
		 * @param tranid (string).
		 * @return (void)
		 */
		 async processRequestDetailResponse (partID, tranid) {

			this.log('processRequestDetailResponse() - BEGIN');
			// this.log(partID);
			
			let listPartDetails = await db.part.where('[tranid+item]').equals([tranid, partID]).toArray();	

			if (listPartDetails.length > 0) {
				let self = this;												

				// process detail lines
				listPartDetails.forEach(function (item) {
					self.partRequestLines.push({
						partNumber: item.fullname,
						desc: item.description,
						eta: item.expectedshipdate,
						orderedQuantity: item.ordered_qty,
						pendingQuantity: item.pending_qty,
						transactionlinetype: item.transactionlinetype,
						receivedInventory: item.transactionlinetype === 'RECEIVING' ? true : false,
						lineNumber: item.item,
						detailId: '',
						activityStatus: self.ofs.props.activityStatus.value,
						consigned: item.custitem_is_consigned === 'T' ? 'Consigned Inventory' : 'Burroughs Owned'
					});
				});	
				
				self.partRequestLines.forEach(function(item, index) {
						item.detailId = index;
				});
				
				self.partOrderDetailDialog = true;				
			}	
			
			this.overlay = false;
			this.orderHeadersAreLoading = false;
		},

		/**
		 * Method to process the open the note dialog
		 *
		 * @param item (obj).		 
		 * @return (void)
		 */
		handleAddNoteButtonClick: function(item) {
			this.noteDialog = true; 
			this.note.date = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().substring(0, 16);
			this.selectedPartRequestId = item.requestId;
		},


		/**
		 * Method to process the submit note		 
		 * @return (void)
		 */
		handleSubmitNote: function () {			
			this.submitLoading = true;							
			let body = {
				Request_ErrorLog: ''
			};	
			
			//PROD	
			let url = `${this.ofsParentOrigin}/rest/ofscCore/v1/resources/${this.ofs.props.techExternalId.value}`;

			//TEST
			// let url = `${this.ofsParentOrigin}/rest/ofscCore/v1/resources/001837`;		
			
			this.note.note = 'Request #' + this.selectedPartRequestId + ' ' + this.note.note;

			if (this.notesLogs?.length > 0) {									
								
				this.notesLogs.unshift(this.note);					

			} else {
				this.notesLogs.push(this.note);
			}

			if(this.notesLogs?.length > 21845) {
				this.notesLogs.pop();
			}					

			body.Request_ErrorLog = JSON.stringify(this.notesLogs);

			this.requestBody.payload= body;

			if (this.isOnline) {
				this.makeApiRequest("PATCH", url, this.ofs.config.ofscClientId.value, this.ofs.config.ofscClientSecret.value, this.requestBody, this.processOFSUpdateResourcePropResponse);					
			} else {
				this.showSnackBar('red', 'Invalid response received from the server!');
			}

		},

		/**
		 * Method to process the add note to Resource response
		 *
		 * @param respObj (obj).		 
		 * @return (void)
		 */
		async processOFSUpdateResourcePropResponse(respObj, reqObj = null) {
			this.log("processOFSUpdateResourcePropResponse() - BEGIN");
			respObj.json()
				.then(async (data) => {			
				this.log("Successfully updated OFS Resource Prop");
				this.log(data);
				let self = this;

				self.noteDialog = false
				self.submitLoading = false;

				self.note.note = '';
				self.note.date = new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString().substring(0, 16);			
				
				if (data.Request_ErrorLog?.length > 0) {

				self.notesLogs = JSON.parse(data.Request_ErrorLog);
				self.notesLogs.forEach(function(item, index) {
					item.noteId = index;
				});

				await db.notes.clear();
				await db.notes.bulkPut(self.notesLogs);
				}						
				
				self.showSnackBar('green', 'Successfully add notes', 3000);
			})
		},


		openNotesLogDialog: function(){										
			// this.notesLogResultsLoading = true;
			this.notesLogDialog = true;
		},

		getNotesLog: function(){			
			//PROD	
			let url = `${this.ofsParentOrigin}/rest/ofscCore/v1/resources/${this.ofs.props.techExternalId.value}`;

			//TEST
			// let url = `${this.ofsParentOrigin}/rest/ofscCore/v1/resources/001837`;	
			this.notesLogs.length = 0;						

			if (this.isOnline) {
			// Get the part request headers
				this.makeApiRequest("GET", url, this.ofs.config.ofscClientId.value, this.ofs.config.ofscClientSecret.value, null, this.processOFSGetNotesLogPropResponse);								
			} else {
				this.log("IN OFFLINE"); 
				let localNoteLogs = db.notes.toArray();
				if(localNoteLogs.length > 0){
				this.notesLogs = localNoteLogs;
					this.log(localNoteLogs);
					this.log('Note Logs loaded from offline data store.');
				} else {
					this.log('Offline data not available');   			  
				}      
				this.requestResultsLoading = false;
			}
		},

		async processOFSGetNotesLogPropResponse(respObj){			
			respObj.json()
				.then(async(data) => {			
				this.log("Successfully GET OFS Resource Prop");
				let self = this; 
				if (data.Request_ErrorLog?.length > 0) {

					self.notesLogs = JSON.parse(data.Request_ErrorLog);
					self.notesLogs.forEach(function(item, index) {
						item.noteId = index;
					});

					await db.notes.clear();
					await db.notes.bulkPut(self.notesLogs);
				}
				// self.notesLogResultsLoading = false;								
			})
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

			if(typeof ofsDataToLog !=='undefined' && typeof ofsDataToLog.securedData != 'undefined' ) {
				ofsDataToLog.securedData.netsuiteUser = '<REMOVED>';
				ofsDataToLog.securedData.netsuitePassword = '<REMOVED>';
			}

			this.log(ofsDataToLog);

			// Set required config values
			if(typeof ofsData.securedData !== 'undefined') {
				this.ofs.config.partRequestHeaderEndpoint.value = ofsData.securedData.partRequestHeaderEndpoint;
				this.ofs.config.partRequestDetailEndpoint.value = ofsData.securedData.partRequestDetailEndpoint;			
				this.ofs.config.partRequestTrackingDetailEndpoint.value = ofsData.securedData.partRequestTrackingDetailEndpoint;
				
				this.ofs.config.netsuiteUser.value = ofsData.securedData.netsuiteUser;
				this.ofs.config.netsuitePassword.value = ofsData.securedData.netsuitePassword;

				this.ofs.config.ofscClientId.value = ofsData.securedData.ofscClientId;
				this.ofs.config.ofscClientSecret.value = ofsData.securedData.ofscClientSecret;
			}

			// Set properties from the Activity
			if (typeof ofsData.activity !== 'undefined')
			{
				this.ofs.props.callId.value = ofsData.activity.call_id;
				this.ofs.props.customer.value = ofsData.activity.cname + '/' + ofsData.activity.site;
				if(typeof ofsData.activity.order_number !== 'undefined') {
				this.ofs.props.orderNumber.value = ofsData.activity.order_number;
				this.partRequestSearchQuery = ofsData.activity.order_number;
				this.ofs.props.activityStatus.value = ofsData.activity.astatus;
			}	
			}

			// Set properties from the Resource
			if(typeof ofsData.resource !== 'undefined'){
				this.ofs.props.technicianId.value = ofsData.resource.techinvsiteid;
				this.ofs.props.lob.value = ofsData.resource.burrough_resource_lob;
				this.ofs.props.techExternalId.value = ofsData.resource.external_id;				
			} 							
			
			if(ofsData.method === "open") {
				this.note.userName = ofsData.user?.uname || "Plugin";

				if((typeof ofsData.user !== 'undefined' && ofsData.user.ulogin === ofsData.resource.email) || (typeof ofsData.openParams !== 'undefined' && ofsData.openParams.adminAccess === "true")) {
					this.isVerify = true;
					this.initializePlugin();
				} else {
					this.showSnackBar("red", "You do not have permission to view tech Part Request. Please check with administrator!", -1);
				}
				this.log(this.ofs.props);
			}			
		},

		initializeServiceWorker: function () {
		this.log('initializeServiceWorker() - BEGIN');
		if (this.SERVICE_WORKER_ENABLED) {
			// Register Service Worker
			if ('serviceWorker' in navigator)
			{
			this.log('initializeServiceWorker() - Registering Service Worker...');
			navigator.serviceWorker
				.register('./service-worker.js')
				// eslint-disable-next-line
				.then(reg => {
				this.log('initializeServiceWorker() - Service Worker registered.');
				})
				.catch(err => {
				this.log('initializeServiceWorker() - Error registering Service Worker:');
				console.log(err);
				});
			// When ready, store a handle to the Service Worker registration object.  We
			// need this later to send postMessage() events to the Service Worker.  Currently,
			// we are only sending an init message that passes information used for logging / troubleshooting.
			navigator.serviceWorker.ready.then( registration => {
				this.swRegistration = registration;
			});
			// // Set up any event handlers for postMessage() events coming from the Service
			// // Worker.  Currently, we only need one, to handle a failed POST.
			// navigator.serviceWorker.onmessage = function (e) {
			// 	console.log('POST MESSAGE FROM SERVICE WORKER!');
			// 	console.log(e.data);
			// 	self.handleFailedPostFromServiceWorker(e);
			// };
			} else {
			this.showSnackBar('orange', 'This browser does not appear to support Service Workers.  Offline capability will not be available.', 3000);
			}
		} else {
			this.log('initializeServiceWorker() - Service Worker functionality is DISABLED in the plugin.');
		}      
		},

		initializePlugin: function () {
			this.log('initializePlugin() - BEGIN');

			this.getDepotManager();
			this.getNotesLog();


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

#no-background-hover::before {
   background-color: transparent !important;
}


.mobile {
      color: #333;
    }

@media screen and (max-width: 768px) {
.mobile tr {
max-width: 100%;
position: relative;
display: block;
}

/* .mobile tr:nth-child(odd) {
border-left: 6px solid deeppink;
}

.mobile  tr:nth-child(even) {
border-left: 6px solid cyan;
} */

.mobile tr td {
display: flex;
width: 100%;
border-bottom: 1px solid #f5f5f5;
height: 15rem !important;
padding: 10px;
}

.mobile tr td ul li:before {
content: attr(data-label);
padding-right: .5em;
text-align: left;
display: block;
color: #999;

}
.v-datatable__actions__select
{
width: 50%;
margin: 0px;
justify-content: flex-start;
}
.mobile tr:hover:not(.v-datatable__expand-row) {
background: transparent !important;
}
}

.flex-content {
	padding: 0;
	margin: 0;
	list-style: none;
	display: flex;
	flex-wrap: wrap;
	width: 100%;
}

.flex-item {
	padding: 5px;
	width: 50%;
	height: 50px;
	font-weight: bold;
	overflow: hidden;
}
</style>
