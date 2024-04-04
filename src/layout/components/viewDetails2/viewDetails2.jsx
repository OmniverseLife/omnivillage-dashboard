/* eslint-disable no-unsafe-optional-chaining */
import styled from "@emotion/styled";
import { Button, Modal, Stack } from "@mui/material";
import moment from "moment";
import React from "react";

const StyledRow = styled(Stack)`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #eee;
  p {
    width: 200px;
    padding: 10px;
    width: 50%;
    text-transform: capitalize;
    word-break: break-all;
    /* border-bottom: 1px solid #eee; */
  }
  h2 {
    width: 100%;
    padding: 20px 10px;
    text-transform: capitalize;
    /* border-bottom-color: #ccc; */
  }
  h3 {
    width: 100%;
    padding: 12px 10px;
    text-transform: capitalize;
    /* border-bottom-color: #ccc; */
    /* border-bottom: 1px solid #eee; */
  }
`;

function ViewDetails2({ open, setOpen, data, heading }) {
  let obj = {
    id: 1,
    email: "johndoe@gmail.com",
    name: "John Doe",
    phone: "+91 3674689047",
    totalLand: 50,
  };

  const tableRow = (array, level = 0) => {
    return [
      ...array.map((_item) => {
        const item = Object.entries(_item);
        return item.map((_data, index) => {
          return Array.isArray(_data[1]) ? (
            <>
              <StyledRow
                direction="row"
                key={_data[0]}
                sx={{ borderBottomColor: "#ccc !important" }}
              >
                <h3>{_data[0].replaceAll("_", " ")}</h3>
              </StyledRow>
              {tableRow(_data[1], 2)}
            </>
          ) : (
            <StyledRow
              direction="row"
              key={_data[0]}
              sx={{
                borderBottomColor:
                  index === item.length - 1 ? "#ccc !important" : "#eee",
                paddingInline: `${10 * level}px`,
              }}
            >
              <p>{_data[0].replaceAll("_", " ")}</p>
              <p>
                {_data[0] === "createdAt" ||
                _data[0] === "updatedAt" ||
                _data[0] === "month_planted" ||
                _data[0] === "month_harvested"
                  ? moment(_data[1]).format("dddd, DD MMM YYYY hh:mm a")
                  : _data[1]?.toString()}
              </p>
            </StyledRow>
          );
        });
      }),
    ];
  };

  return (
    // <Stack>
    <Modal open={open} className="modal">
      <Stack
        width="auto"
        minWidth="40vw"
        bgcolor={"#fff"}
        borderRadius={1}
        padding={2}
        color={"#000"}
        maxHeight="90vh"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          borderBottom={"1px solid #333"}
          paddingBottom={1}
        >
          <h3>{heading} Details</h3>
          <i
            className="fa-solid fa-xmark actionIcon"
            style={{ fontSize: 25 }}
            onClick={() => setOpen()}
          ></i>
        </Stack>
        <Stack
          margin="20px 0"
          direction="column"
          sx={{
            overflowY: "scroll",
          }}
        >
          {Object.entries(data).map((_data) => {
            return Array.isArray(_data[1]) ? (
              <>
                <StyledRow
                  direction="row"
                  key={_data[0]}
                  sx={{ borderBottomColor: "#ccc !important" }}
                >
                  {_data[0] === "members" ? (
                    <h3>{_data[0].replaceAll("_", " ")}</h3>
                  ) : (
                    <h2>{_data[0].replaceAll("_", " ")}</h2>
                  )}
                </StyledRow>
                {tableRow(_data[1])}
              </>
            ) : (
              <StyledRow direction="row" key={_data[0]}>
                <p>{_data[0].replaceAll("_", " ")}</p>
                <p>
                  {_data[0] === "createdAt" ||
                  _data[0] === "updatedAt" ||
                  _data[0] === "month_planted" ||
                  _data[0] === "month_harvested"
                    ? moment(_data[1]).format("dddd, DD MMM YYYY hh:mm a")
                    : _data[1]?.toString()}
                </p>
              </StyledRow>
            );
          })}
        </Stack>
        <Stack spacing={2} direction="row" alignSelf="flex-end">
          <Button
            variant="outlined"
            color="warning"
            style={{ outline: "none" }}
            onClick={() => setOpen()}
          >
            Close
          </Button>
        </Stack>
      </Stack>
    </Modal>
    // {/* </Stack> */}
  );
}

export default ViewDetails2;
