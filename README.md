# Burrough Part Request Plugin

**Note: Using Node.js v16.14.2 (latest LTS as of 04/18/2022).**

&nbsp;


## Purpose

The purpose of the Part Requests plugin is to allow techs to view orders and their status. They can track
the shipments. The data is stored in the external database in the part order tables . The plugin will
query the database via NetSuite. NetSuite will receive order updates from S21



&nbsp;

## UI Design Details

1. Click on a row to view the detail. The header is green while shipments are in process. It is white when shipments are complete.
1. Click on the carrier logo to open new window with the shipper’s tracking information page.
1. UI will display the latest 10 Requests. Search feature on the list will get additional data from external database based on search criteria. Search can be made on fields - Request Number,  Customer, Task No, and Warehouse Code


&nbsp;

## NetSuite Endpoints

Please refer to the “Integration List” section in the document “TDD_Burrough_OFS_Impl_Part_1-of-3_Architecture+NetSuite_v1x” for NetSuite endpoint information.

&nbsp;

## Additional Requirements and Logic

- The Part Request plugin will receive inventory, order status, and shipment updates from S21 via  NetSuite.
- Updates will sync to Mobile App automatically when user is logged into the app. A plugin notification will alert the user when updates are received while the user is on the app.




&nbsp;


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
