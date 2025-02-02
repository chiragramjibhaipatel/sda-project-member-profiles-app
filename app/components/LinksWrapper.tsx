import type { FieldName } from "@conform-to/dom";
import { useField, useInputControl } from "@conform-to/react";
import { useEffect, useState } from "react";
import { FormLayout, TextField, Text, BlockStack } from "@shopify/polaris";

export function LinksWrapper({
  website,
  linked_in,
  you_tube,
  twitter,
  github,
  alternative_contact,
}: {
  website: FieldName<string | null>;
  twitter: FieldName<string | null>;
  linked_in: FieldName<string | null>;
  github: FieldName<string | null>;
  you_tube: FieldName<string | null>;
  alternative_contact: FieldName<string | null>;
}) {
  const [metaWebsite] = useField(website);
  const metaWebsiteInput = useInputControl(metaWebsite);
  const [metaWebsiteInputValue, setMetaWebsiteInputValue] = useState(
    metaWebsiteInput.value,
  );

  useEffect(() => {
    setMetaWebsiteInputValue(metaWebsiteInput.value || "");
  }, [metaWebsiteInput.value]);

  const handleMetaWebsiteChange = (value: string) => {
    metaWebsiteInput.change(value);
    setMetaWebsiteInputValue(value);
  };

  const [metaTwitter] = useField(twitter);
  const metaTwitterInput = useInputControl(metaTwitter);
  const [metaTwitterInputValue, setMetaTwitterInputValue] = useState(
    metaTwitterInput.value,
  );
  useEffect(() => {
    setMetaTwitterInputValue(metaTwitterInput.value || "");
  }, [metaTwitterInput.value]);

  const handleMetaTwitterChange = (value: string) => {
    metaTwitterInput.change(value);
    setMetaTwitterInputValue(value);
  };

  const [metaLinkedIn] = useField(linked_in);
  const metaLinkedInInput = useInputControl(metaLinkedIn);
  const [metaLinkedInInputValue, setMetaLinkedInInputValue] = useState(
    metaLinkedInInput.value,
  );
  useEffect(() => {
    setMetaLinkedInInputValue(metaLinkedInInput.value || "");
  }, [metaLinkedInInput.value]);

  const handleMetaLinkedInChange = (value: string) => {
    metaLinkedInInput.change(value);
    setMetaLinkedInInputValue(value);
  };

  const [metaGitHub] = useField(github);
  const metaGitHubInput = useInputControl(metaGitHub);
  const [metaGitHubInputValue, setMetaGitHubInputValue] = useState(
    metaGitHubInput.value,
  );
  useEffect(() => {
    setMetaGitHubInputValue(metaGitHubInput.value || "");
  }, [metaGitHubInput.value]);

  const handleMetaGitHubChange = (value: string) => {
    let newValue = value;
    if (!newValue) {
      newValue = "";
    }
    metaGitHubInput.change(newValue);
    setMetaGitHubInputValue(newValue);
  };

  const [metaYouTube] = useField(you_tube);
  const metaYouTubeInput = useInputControl(metaYouTube);
  const [metaYouTubeInputValue, setMetaYouTubeInputValue] = useState(
    metaYouTubeInput.value,
  );
  useEffect(() => {
    setMetaYouTubeInputValue(metaYouTubeInput.value || "");
  }, [metaYouTubeInput.value]);

  const handleMetaYouTubeChange = (value: string) => {
    metaYouTubeInput.change(value);
    setMetaYouTubeInputValue(value);
  };

  const [metaAlternativeContact] = useField(alternative_contact);
  const metaAlternativeContactInput = useInputControl(metaAlternativeContact);
  const [
    metaAlternativeContactInputValue,
    setMetaAlternativeContactInputValue,
  ] = useState(metaAlternativeContactInput.value);
  useEffect(() => {
    setMetaAlternativeContactInputValue(metaAlternativeContactInput.value || "");
  }, [metaAlternativeContactInput.value]);

  const handleMetaAlternativeContactChange = (value: string) => {
    metaAlternativeContactInput.change(value);
    setMetaAlternativeContactInputValue(value);
  };

  return (
    <BlockStack gap={"400"}>
      <Text as="h2" variant="headingLg">
        Links
      </Text>
      <FormLayout>
        <FormLayout.Group condensed>
          <TextField
            autoComplete={"off"}
            label="Website"
            value={metaWebsiteInputValue}
            onChange={handleMetaWebsiteChange}
            error={metaWebsite.errors}
          />
          <TextField
            autoComplete={"off"}
            label="Twitter"
            value={metaTwitterInputValue}
            onChange={handleMetaTwitterChange}
            error={metaTwitter.errors}
          />
        </FormLayout.Group>
        <FormLayout.Group condensed>
          <TextField
            autoComplete={"off"}
            label="LinkedIn"
            value={metaLinkedInInputValue}
            onChange={handleMetaLinkedInChange}
            error={metaLinkedIn.errors}
          />
          <TextField
            autoComplete={"off"}
            label="GitHub"
            value={metaGitHubInputValue}
            onChange={handleMetaGitHubChange}
            error={metaGitHub.errors}
          />
        </FormLayout.Group>
        <FormLayout.Group condensed>
          <TextField
            autoComplete={"off"}
            label="YouTube"
            value={metaYouTubeInputValue}
            onChange={handleMetaYouTubeChange}
            error={metaYouTube.errors}
          />
          <TextField
            autoComplete={"off"}
            label="Alternative Contact"
            value={metaAlternativeContactInputValue}
            onChange={handleMetaAlternativeContactChange}
            error={metaAlternativeContact.errors}
          />
        </FormLayout.Group>
      </FormLayout>
    </BlockStack>
  );
}
