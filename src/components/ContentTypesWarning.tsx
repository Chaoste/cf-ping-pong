import React from "react";
import { Paragraph, TextLink, Note, Flex } from "@contentful/f36-components";
import { useNavigate } from "react-router";

export const ContentTypesWarning = () => {
  const navigate = useNavigate();

  return (
    <Flex marginTop="spacingXl" justifyContent="center">
      <Note
        title="Setup your content model to use this app"
        style={{ maxWidth: "800px" }}
      >
        <Paragraph>
          This app requires specific content types to be present in your space.
          To set up the required content types, click
          <TextLink as="button" onClick={() => navigate("/setupContentModel")}>
            here
          </TextLink>
          .
        </Paragraph>
      </Note>
    </Flex>
  );
};
