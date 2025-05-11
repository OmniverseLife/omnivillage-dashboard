import Wrapper from "../../../components/wrapper/wrapper";
import DeclarationVsUseScatterChart from "./components/DeclaredVsInUse";
import LandUseSankeyChart from "./components/LandIdleSankey";
import LandUsagePurposeTreeMap from "./components/LandUsageTree";
import LandUseDistributionChart from "./components/LandUseDistribution";
import LandUtilisationPieChart from "./components/LandUtilizationDistribution";
import ParcelSizeDistribution from "./components/ParcelSizeDistribution";
import PurchaseTimelineAreaSpineChart from "./components/PurchaseTimeline";

export default function LandholdingDashboard() {
  return (
    <Wrapper>
      <ParcelSizeDistribution />
      <LandUtilisationPieChart/>
      <LandUsagePurposeTreeMap/>
      <LandUseDistributionChart />
      <LandUseSankeyChart/>
      <PurchaseTimelineAreaSpineChart/>
      <DeclarationVsUseScatterChart/>
    </Wrapper>
  );
}
