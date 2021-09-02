import { cssVariables } from 'feather';
import moment from 'moment-timezone';

import { languages } from '@/intl';

// REGEX
// eslint-disable-next-line no-useless-escape
export const EMAIL_PARSE_REGEX = /(?:(?:[^<>()\[\]\\.,;:+\s@"]+(?:\.[^<>()\[\]\\.,;:+\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

export const EMAIL_REGEX = new RegExp(`^${EMAIL_PARSE_REGEX.source}$`);

export const URL_PARSE_REGEX = /(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?/gi;
export const URL_REGEX = new RegExp(`^${URL_PARSE_REGEX.source}$`);

// eslint-disable-next-line no-useless-escape
export const URI_REGEX = /^([a-z0-9+.-]+):(?:\/\/(?:((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(?::(\d*))?(\/(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?|(\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*)?)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i;

export const IS_INTEGER_REGEX = /^[-]?[0-9]+$/;

// URLs
export const CLOUD_FRONT_URL = 'https://dxstmhyqfqr1o.cloudfront.net';

// Constants
export const NAVIGATION_BAR_HEIGHT = 48;
export const EMAIL_VERIFICATION_BANNER_HEIGHT = 48;
export const EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION = 1;

export const DATE_FNS_DEFAULT_DATE_FORMAT = 'MMM d, yyyy';

export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY';
export const MONTH_DATE_FORMAT = 'MMM, YYYY';
export const FULL_MONTH_DATE_FORMAT = 'MMMM D, YYYY';
export const DEFAULT_TIME_FORMAT = 'HH:mm';
export const DEFAULT_DATE_TIME_FORMAT = `${DEFAULT_DATE_FORMAT} [at] ${DEFAULT_TIME_FORMAT}`;
export const FULL_MONTH_DATE_TIME_FORMAT = 'MMMM D, YYYY [at] h:mm A';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';
export const ISO_DATE_FORMAT_REGEX = /\d{4}-\d{2}-\d{2}/;
export const DOT_DATE_FORMAT = 'YYYY.MM.DD';
export const MONTHLY_DATE_FORMAT = 'YYYY-MM';
export const WEEKLY_DATE_FORMAT = 'YYYY-[W]W';
export const TIME_DATE_FORMAT = `${DEFAULT_DATE_FORMAT} [at] h:mm A`;
export const DATE_WITH_SECONDS_FORMAT = `${DEFAULT_DATE_FORMAT} [at] h:mm:ss A`;
export const DATE_WITHOUT_YEAR_FORMAT = 'MMM D';

export const MAX_MESSAGES_COUNT = 100; // 500;
export const LIST_LIMIT = 20;
export const AGENT_GROUP_LIST_LIMIT = 20;
export const EXPORTS_LIST_LIMIT = 15;
export const APPLICATION_LIST_LIMIT = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as readonly PerPage[];

export const DEFAULT_LOCALE: keyof typeof languages = 'en';
export const CONTRACTED = 'CONTRACTED';
export const EXPANDED = 'EXPANDED';
export const EMPTY_TEXT = '—';

export const BYTES_IN_MEGABYTE = 1000000;

export const isProduction = process.env.BUILD_MODE === 'production';

// Countries
export const COUNTRY_LIST = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antigua',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'British Indian Ocean Territory',
  'British Virgin Islands',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burma Myanmar',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Cayman Islands',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Cook Islands',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Ethiopia',
  'Falkland Islands',
  'Faroe Islands',
  'Federated States of Micronesia',
  'Fiji',
  'Finland',
  'France',
  'French Guiana',
  'French Polynesia',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Greenland',
  'Grenada',
  'Guadeloupe',
  'Guam',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macau',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Martinique',
  'Mauritania',
  'Mauritius',
  'Mayotte',
  'Mexico',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'Netherlands Antilles',
  'New Caledonia',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Niue',
  'Norfolk Island',
  'North Korea',
  'Northern Mariana Islands',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Puerto Rico',
  'Qatar',
  'Republic of the Congo',
  'Reunion',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Barthelemy',
  'Saint Helena',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Martin',
  'Saint Pierre and Miquelon',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tokelau',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Turks and Caicos Islands',
  'Tuvalu',
  'US Virgin Islands',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Wallis and Futuna',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

// menus
export enum Product {
  chat = 'chat',
  calls = 'calls',
  desk = 'desk',
}

export enum Page {
  // common
  overview = 'overview',
  settings = 'settings',
  users = 'users',

  // chat
  openChannels = 'open_channels',
  groupChannels = 'group_channels',
  announcements = 'announcements',
  messageSearch = 'messageSearch',
  dataExports = 'data_export',
  analytics = 'analytics',

  // desk
  tickets = 'tickets',
  allTickets = 'all_tickets',
  conversation = 'conversation',
  views = 'views',
  assignmentLogs = 'assignment_logs',
  proactiveChat = 'proactive_chat',
  monitor = 'monitor',
  agents = 'agents',
  customers = 'customers',
  deskDataExport = 'desk_data_export',
  reports = 'reports',

  // calls
  directCalls = 'direct_calls',
  groupCalls = 'group_calls',
  callsStudio = 'calls_studio',
  callsActivation = 'calls_activation',

  // etc
  support = 'support',

  // higher level page
  organization = 'organization',
  application = 'application',
  desk = 'desk',
  calls = 'calls',
}

export enum AgentPage {
  tickets = 'tickets',
  assignmentLogs = 'assignmentLogs',
  proactiveChat = 'proactiveChat',
  customers = 'customers',
  settings = 'settings',
}

export enum OrganizationSettingMenu {
  general = 'general',
  usage = 'usage',
  applications = 'applications',
  members = 'members',
  billing = 'billing',
  billing_invoices = 'billing_invoices',
  security = 'security',
  roles = 'roles',
  contactUs = 'contact_us',
  community = 'community',
}

/**
 * Predefined roles
 * TODO: change it to enum
 */

export const PredefinedRoles = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  BILLING: 'BILLING',
  DESK_ADMIN: 'DESK_ADMIN',
  DESK_AGENT: 'DESK_AGENT',
  CALL_USER: 'CALL_USER',
  DEFAULT: 'DEFAULT',
};

export const SuperRoles = [PredefinedRoles.OWNER, PredefinedRoles.ADMIN];

// desk
// search
export enum SearchTypes {
  DESK_ADMIN_TICKETS = 'DESK_ADMIN_TICKETS',
  DESK_AGENT_TICKETS = 'DESK_AGENT_TICKETS',
}

export const CONNECTION_COLORS = {
  ONLINE: cssVariables('green-5'),
  AWAY: cssVariables('orange-6'),
  OFFLINE: cssVariables('neutral-5'),
};

export const NOTIFICATION_PERMISSION = {
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export enum DATE_TYPES {
  YEAR = 'year',
  MONTH = 'month',
}

export enum OVERVIEW_STATISTICS_TYPES {
  DAU = 'dau',
  MAU = 'mau',
  CONNECTIONS = 'connections',
  MESSAGES = 'messages',
}

export const BYTES_PER_GIGABYTE = 1024 * 1024 * 1024;

export const TIMEZONE_OPTIONS = (() => {
  const momentObj = moment();
  return moment.tz.names().map((name) => ({ value: name, label: `(UTC${momentObj.tz(name).format('Z')}) ${name}` }));
})();

export * from './common';
export * from './core';
export * from './calls';
export * from './desk';
export * from './organizations';
