"use strict";
const MIN_CAMPAIGN_CREDITS=350;
const CAMPAIGN_TYPES=Object.freeze(["ORGANIC_REACH","AI_ALGORITHM_OPTIMIZATION","MONETIZATION_GROWTH","EDITORIAL_OUTREACH","MONTHLY_LISTENER_GROWTH"]);
const CAMPAIGN_STATUSES=Object.freeze(["PENDING","ACTIVE","INSUFFICIENT_FUNDS","COMPLETED","CANCELLED"]);
const ALLOWED_TRANSITIONS=Object.freeze({PENDING:["ACTIVE","INSUFFICIENT_FUNDS","CANCELLED"],ACTIVE:["PENDING","COMPLETED","CANCELLED"],INSUFFICIENT_FUNDS:["PENDING","CANCELLED"],COMPLETED:[],CANCELLED:[]});
function classifyCampaignFunding(balance,requested){if(!Number.isSafeInteger(balance)||!Number.isSafeInteger(requested)||requested<MIN_CAMPAIGN_CREDITS)return "INSUFFICIENT_FUNDS";return balance>=requested?"PENDING":"INSUFFICIENT_FUNDS"}
function canTransitionCampaign(from,to){return from===to||Boolean(ALLOWED_TRANSITIONS[from]?.includes(to))}
module.exports={MIN_CAMPAIGN_CREDITS,CAMPAIGN_TYPES,CAMPAIGN_STATUSES,classifyCampaignFunding,canTransitionCampaign};
