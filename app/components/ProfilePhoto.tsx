import {
  DropZone,
  Thumbnail,
  Banner,
  List,
  Text,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

export function ProfilePhoto() {
  const [files, setFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const hasError = rejectedFiles.length > 0;

  const handleDrop = useCallback(
    (_droppedFiles: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
      setFiles((files) => [...files, ...acceptedFiles]);
      setRejectedFiles(rejectedFiles);
    },
    [],
  );

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionTitle="Add Image" />
  );
  const uploadedFiles = files.length > 0 && (
    <BlockStack>
      {files.map((file, index) => (
        <InlineStack key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={window.URL.createObjectURL(file)}
          />
          <div>
            {file.name}{" "}
            <Text variant="bodySm" as="p">
              {file.size} bytes
            </Text>
          </div>
        </InlineStack>
      ))}
    </BlockStack>
  );

  const errorMessage = hasError && (
    <Banner title="The following images couldn’t be uploaded:" tone="critical">
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  return (
    <BlockStack>
      {errorMessage}
      <DropZone
        label={"Profile Photo"}
        accept="image/*"
        type="image"
        onDrop={handleDrop}
      >
        {uploadedFiles}
        {fileUpload}
      </DropZone>
    </BlockStack>
  );
}
