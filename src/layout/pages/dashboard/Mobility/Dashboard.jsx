import Wrapper from "../../../components/wrapper/wrapper";
import MobilityGapDashboard from "./components/MobilityGapDashboard";
import TravelDistanceSplitChart from "./components/TravelDistanceSplit";
import TravelPurposeDistributionChart from "./components/TravelPurposeDistribution";
import VehiclesPerUserChart from "./components/VehiclePerUser";
import VehicleRequirementChart from "./components/VehicleReqirementChart";
import VehicleTypeDistributionChart from "./components/VehicleTypeDistributionChart";
import VehicleUrgencyDivergingChart from "./components/VehicleUrgencyDivergingChart";
import VehicleUsageFrequencyChart from "./components/VehicleUsageFrequency";

export default function Dashboard() {
  return (
    <Wrapper>
      <VehicleTypeDistributionChart />
      <TravelDistanceSplitChart/>
      <TravelPurposeDistributionChart/>
      <VehicleUsageFrequencyChart/>
      <VehicleRequirementChart/>
      <VehicleUrgencyDivergingChart/>
      <VehiclesPerUserChart/>
      <MobilityGapDashboard/>
    </Wrapper>
  );
}
