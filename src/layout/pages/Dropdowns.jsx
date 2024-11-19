import React from "react";
import Wrapper from "../components/wrapper/wrapper";
import DemographicDropdown from "../components/Dropdowns/demographic";
import LandholdingDropdown from "../components/Dropdowns/landholding";
import HousingDropdown from "../components/Dropdowns/housing";
import WaterDropdown from "../components/Dropdowns/water";
import EnergyDropdown from "../components/Dropdowns/energy";
import MobilityDropdown from "../components/Dropdowns/mobility";
import { Stack } from "@mui/material";

export default function Dropdowns() {
    return (
        <Wrapper>
            <Stack direction="column" spacing={10}>
                <DemographicDropdown />
                <LandholdingDropdown />
                <HousingDropdown />
                <WaterDropdown />
                <EnergyDropdown />
                <MobilityDropdown />
            </Stack>
        </Wrapper>
    );
}
