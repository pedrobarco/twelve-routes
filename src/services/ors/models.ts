type ORSLocation = [lon: number, lat: number];
type ORSTimeWindow = [start: number, end: number];

interface ORSJob {
  id: number;
  location: ORSLocation;
  description?: string;
  setup?: number;
  service?: number;
  skills?: number[];
  time_windows?: ORSTimeWindow[];
}

interface ORSVehicle {
  id: number;
  profile: string;
  start: ORSLocation;
  end: ORSLocation;
  capacity?: number[];
  skills?: number[];
  time_window?: ORSTimeWindow;
}

export interface ORSOptimizationRequest {
  vehicles: ORSVehicle[];
  jobs: ORSJob[];
}

interface ORSStep {
  type: string;
  description?: string;
  location: ORSLocation;
  id?: number;
  setup: number;
  service: number;
  waiting_time: number;
  job?: number;
  arrival: number;
  duration: number;
}

interface ORSRoute {
  vehicle: number;
  cost: number;
  setup: number;
  service: number;
  duration: number;
  waiting_time: number;
  priority: number;
  steps: ORSStep[];
}

export interface ORSOptimizationResponse {
  code: number;
  routes: ORSRoute[];
}
