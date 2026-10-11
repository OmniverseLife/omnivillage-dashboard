import Wrapper from "../../../components/wrapper/wrapper";
import BMIDistributionChart from "./components/BMIDistribution";
import ChronicDiseasePrevalenceChart from "./components/ChronicDisease";
import DietShareChart from "./components/DietShare";
import IncomeRangeChart from "./components/IncomeRanges";
import MaritalStatusChart from "./components/MaritalStatus";
import MotorDisabilityPrevalenceChart from "./components/MotorDisability";
import OccupationTreeMap from "./components/OccupationTree";
import PopulationSnapshot from "./components/PopulationSnapshot";
import { Grid } from "@mui/material";
import SavingsAndInvestmentsChart from "./components/SavingsAndInvestments";
import HabitsChart from "./components/HabitsCloud";
import EducationAspirationsChart from "./components/EducationAspirations";

export default function DemographicDashboard() {
  return (
    <Wrapper>
      <PopulationSnapshot />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <MaritalStatusChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <DietShareChart />
        </Grid>
      </Grid>
      <IncomeRangeChart />
      <BMIDistributionChart />
      <MotorDisabilityPrevalenceChart />
      <ChronicDiseasePrevalenceChart />
      <OccupationTreeMap />
      <SavingsAndInvestmentsChart />
      <HabitsChart/>
      <EducationAspirationsChart/>
    </Wrapper>
  );
}
