import Wrapper from "../../../components/wrapper/wrapper";
import LandUseSankeyChart from "./components/LandIdleSankey";
import LandUsagePurposeTreeMap from "./components/LandUsageTree";
import LandUseDistributionChart from "./components/LandUseDistribution";
import LandUtilisationPieChart from "./components/LandUtilizationDistribution";
import ParcelSizeDistribution from "./components/ParcelSizeDistribution";

export default function LandholdingDashboard() {
  return (
    <Wrapper>
      <ParcelSizeDistribution />
      <LandUtilisationPieChart/>
      <LandUsagePurposeTreeMap/>
      <LandUseDistributionChart />
      <LandUseSankeyChart/>
    </Wrapper>
  );
}
