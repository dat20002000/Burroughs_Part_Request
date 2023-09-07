class PartRequest {

	constructor() {

		this.id = null;
		this.CallId = null;
		this.Customer = null;
		this.requestId = null;
		this.dateShipped = null;
		this.WHSCode = null;
		this.status = null;
		this.order = null;
		this.serialNo = null;
		this.problemCode = null;
		this.reasonCode = null;
		this.Parts = [];
	}
}

class Parts {

	constructor() {

		this.partNumber = null;
		this.description = null;
		this.orderQty = null;
		this.pendQty = null;
		this.DeliverQty = null;
		this.backQty = null;
		this.shipping = [];
	}
}
class Shipping {

	constructor() {

		this.SO = null;
		this.shipQty = null;
		this.ETA = null;
		this.carrier = null;
		this.partNumber = null;
		this.tracking = [];

	}
}

class Tracking {

	constructor() {

		this.SO = null;
		this.shipQty = null;
		this.ETA = null;
		this.carrier = null;
		this.TrackingNo = null;
		this.trackingURL = null;

	}
}


module.exports = {
	PartRequest,
	Parts,
	Shipping,
	Tracking
}
//quantity, part_number, part_description, part_serial_number, mod_name
