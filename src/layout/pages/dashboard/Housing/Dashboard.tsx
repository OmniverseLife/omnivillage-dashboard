import React from "react";
import Wrapper from "../../../components/wrapper/wrapper";
import HousingTypeDonutChart from "./components/HousingType";
import RenovationUrgencyColumnChart from "./components/RenovationUrgency";
import UnitFloorScatterChart from "./components/UnitFloorData";
import BuiltRenovatedLineChart from "./components/BuiltRenovated";
import AmenitiesBarChart from "./components/Amenities";
import AmenitiesHeatmap from "./components/housexamenities";
import EquipmentHorizontalBarChart from "./components/Equipment";
import ExpansionDemandPieChart from "./components/ExpansionUrgency";
import RenovationDemandPieChart from "./components/RenovationUrgencyPie";
import { Grid } from "@mui/material";

export default function Dashboard() {
  return (
    <Wrapper>
      <HousingTypeDonutChart />
      <RenovationUrgencyColumnChart />
      <UnitFloorScatterChart />
      <BuiltRenovatedLineChart />
      <AmenitiesBarChart />
      <AmenitiesHeatmap />
      <EquipmentHorizontalBarChart />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ExpansionDemandPieChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <RenovationDemandPieChart />
        </Grid>
      </Grid>
    </Wrapper>
  );
}
