import { useCallback, useEffect, useState } from 'react';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type _Object,
} from '@aws-sdk/client-s3';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FileUpload from '@cloudscape-design/components/file-upload';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Link from '@cloudscape-design/components/link';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Textarea from '@cloudscape-design/components/textarea';
import { errorMessage, s3 } from '../../lib/aws';
import { useNotifications } from '../../lib/notifications';
import { formatBytes } from '../../lib/zip';

const MAX_PREVIEW_BYTES = 256 * 1024;

export function BucketDetailPage({ bucket }: { bucket: string }) {
  const { notify } = useNotifications();
  const [objects, setObjects] = useState<_Object[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<_Object[]>([]);
  const [modal, setModal] = useState<'upload' | 'text' | null>(null);
  const [preview, setPreview] = useState<{ key: string; body: string } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all: _Object[] = [];
      let token: string | undefined;
      do {
        const res = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            ContinuationToken: token,
          }),
        );
        all.push(...(res.Contents ?? []));
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (token);
      setObjects(all);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err));
      setObjects([]);
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteSelected = async () => {
    try {
      for (const object of selected) {
        await s3.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: object.Key }),
        );
      }
      notify({
        type: 'success',
        content: `Deleted ${selected.length} object(s).`,
      });
      setSelected([]);
      load();
    } catch (err) {
      notify({
        type: 'error',
        header: 'Failed to delete objects',
        content: errorMessage(err),
      });
    }
  };

  const openPreview = async (object: _Object) => {
    if (!object.Key) return;
    if ((object.Size ?? 0) > MAX_PREVIEW_BYTES) {
      notify({
        type: 'info',
        content: `"${object.Key}" is too large to preview here.`,
      });
      return;
    }
    try {
      const res = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: object.Key }),
      );
      setPreview({
        key: object.Key,
        body: (await res.Body?.transformToString()) ?? '',
      });
    } catch (err) {
      notify({
        type: 'error',
        header: `Failed to open "${object.Key}"`,
        content: errorMessage(err),
      });
    }
  };

  const downloadObject = async (object: _Object) => {
    if (!object.Key) return;
    try {
      const res = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: object.Key }),
      );
      const bytes =
        (await res.Body?.transformToByteArray()) ?? new Uint8Array();
      const url = URL.createObjectURL(
        new Blob([bytes as BlobPart], {
          type: res.ContentType ?? 'application/octet-stream',
        }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = object.Key.split('/').pop() || object.Key;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      notify({
        type: 'error',
        header: `Failed to download "${object.Key}"`,
        content: errorMessage(err),
      });
    }
  };

  const onUploaded = (keys: string[]) => {
    setModal(null);
    notify({
      type: 'success',
      content: `Uploaded ${keys.map((key) => `"${key}"`).join(', ')} to "${bucket}".`,
    });
    load();
  };

  return (
    <ContentLayout header={<Header variant="h1">{bucket}</Header>}>
      <div id="s3-objects-table">
        <Table
          items={objects}
          loading={loading}
          loadingText="Loading objects"
          selectionType="multi"
          selectedItems={selected}
          onSelectionChange={({ detail }) => setSelected(detail.selectedItems)}
          trackBy="Key"
          header={
            <Header
              counter={`(${objects.length})`}
              description="Objects are the fundamental entities stored in Amazon S3. Each object is stored under a key (its name)."
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    iconName="refresh"
                    ariaLabel="Refresh"
                    onClick={load}
                  />
                  <Button
                    disabled={selected.length !== 1}
                    onClick={() => downloadObject(selected[0])}
                  >
                    Download
                  </Button>
                  <Button
                    disabled={selected.length === 0}
                    onClick={deleteSelected}
                  >
                    Delete
                  </Button>
                  <span id="btn-create-text-object">
                    <Button
                      disabled={!!loadError}
                      onClick={() => setModal('text')}
                    >
                      Create text file
                    </Button>
                  </span>
                  <span id="btn-upload">
                    <Button
                      variant="primary"
                      iconName="upload"
                      disabled={!!loadError}
                      onClick={() => setModal('upload')}
                    >
                      Upload
                    </Button>
                  </span>
                </SpaceBetween>
              }
            >
              Objects
            </Header>
          }
          columnDefinitions={[
            {
              id: 'key',
              header: 'Name',
              cell: (object) => (
                <Link onFollow={() => openPreview(object)}>{object.Key}</Link>
              ),
            },
            {
              id: 'size',
              header: 'Size',
              cell: (object) => formatBytes(object.Size),
            },
            {
              id: 'modified',
              header: 'Last modified',
              cell: (object) => object.LastModified?.toLocaleString() ?? '-',
            },
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <SpaceBetween size="xxs">
                <b>{loadError ? 'Could not load this bucket' : 'No objects'}</b>
                <Box variant="p" color="inherit">
                  {loadError ?? "You don't have any objects in this bucket."}
                </Box>
              </SpaceBetween>
            </Box>
          }
        />
      </div>

      {modal === 'upload' && (
        <UploadModal
          bucket={bucket}
          onDismiss={() => setModal(null)}
          onUploaded={onUploaded}
        />
      )}
      {modal === 'text' && (
        <TextObjectModal
          bucket={bucket}
          onDismiss={() => setModal(null)}
          onUploaded={onUploaded}
        />
      )}
      {preview && (
        <Modal
          visible
          size="large"
          header={preview.key}
          onDismiss={() => setPreview(null)}
        >
          <pre className="object-preview">{preview.body}</pre>
        </Modal>
      )}
    </ContentLayout>
  );
}

interface ModalProps {
  bucket: string;
  onDismiss: () => void;
  onUploaded: (keys: string[]) => void;
}

function UploadModal({ bucket, onDismiss, onUploaded }: ModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: file.name,
            Body: new Uint8Array(await file.arrayBuffer()),
            ContentType: file.type || 'application/octet-stream',
          }),
        );
      }
      onUploaded(files.map((file) => file.name));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      visible
      header="Upload"
      onDismiss={onDismiss}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={uploading}
              disabled={files.length === 0}
              onClick={upload}
            >
              Upload
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <FormField
        label="Files"
        description={`Each file is stored as an object in "${bucket}", keyed by its file name.`}
        errorText={error}
      >
        <FileUpload
          multiple
          value={files}
          onChange={({ detail }) => setFiles(detail.value)}
          showFileSize
          i18nStrings={{
            uploadButtonText: (multiple) =>
              multiple ? 'Choose files' : 'Choose file',
            dropzoneText: (multiple) =>
              multiple ? 'Drop files to upload' : 'Drop file to upload',
            removeFileAriaLabel: (index) => `Remove file ${index + 1}`,
            limitShowFewer: 'Show fewer files',
            limitShowMore: 'Show more files',
            errorIconAriaLabel: 'Error',
          }}
        />
      </FormField>
    </Modal>
  );
}

// Not a real console feature — a shortcut so students can create a small text
// object without first having to make a file on their own machine.
function TextObjectModal({ bucket, onDismiss, onUploaded }: ModalProps) {
  const [key, setKey] = useState('hello.txt');
  const [body, setBody] = useState('Hello from S3!');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: 'text/plain; charset=utf-8',
        }),
      );
      onUploaded([key]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible
      header="Create text file"
      onDismiss={onDismiss}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={!key.trim()}
              onClick={save}
            >
              Create
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <FormField
          label="Object key"
          description="The object's name inside the bucket."
          errorText={error}
        >
          <Input value={key} onChange={({ detail }) => setKey(detail.value)} />
        </FormField>
        <FormField label="Content">
          <Textarea
            value={body}
            rows={6}
            onChange={({ detail }) => setBody(detail.value)}
          />
        </FormField>
      </SpaceBetween>
    </Modal>
  );
}
