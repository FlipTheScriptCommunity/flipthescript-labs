import React from 'react';
import Box from '@cloudscape-design/components/box';

// A simplified version of the resource map AWS's own "VPC and more" wizard
// shows — both live, as you adjust the form (with placeholder names/CIDRs),
// and again after creation (with the real generated ids). Reusing one
// component for both keeps the "what you're about to get" preview and the
// "what you got" result visually identical, which is the point of the real
// wizard's own live preview.
export default function ResourceMap({
  vpcCidr,
  azs,
  publicSubnets,
  privateSubnets,
  hasPublic,
  natGatewayAzs,
  s3Endpoint,
  showIds,
  ids,
}) {
  const natAzSet = new Set(natGatewayAzs || []);

  return (
    <div className="vpc-map">
      <div className="vpc-map-vpc-label">
        <Box fontWeight="bold">VPC{vpcCidr ? ` — ${vpcCidr}` : ''}</Box>
        {showIds && ids?.vpcId && (
          <Box variant="small" color="text-body-secondary">
            {ids.vpcId}
          </Box>
        )}
      </div>

      {hasPublic && (
        <div className="vpc-map-igw">
          Internet gateway
          {showIds && ids?.internetGatewayId && (
            <span className="vpc-map-id"> · {ids.internetGatewayId}</span>
          )}
        </div>
      )}

      <div className="vpc-map-az-row">
        {azs.map((az) => {
          const pub = publicSubnets.find((s) => s.az === az);
          const priv = privateSubnets.find((s) => s.az === az);
          return (
            <div key={az} className="vpc-map-az-col">
              <div className="vpc-map-az-label">{az}</div>
              {pub && (
                <div className="vpc-map-subnet vpc-map-subnet-public">
                  <div className="vpc-map-subnet-title">Public subnet</div>
                  <div className="vpc-map-subnet-cidr">{pub.cidr}</div>
                  {showIds && pub.subnetId && (
                    <div className="vpc-map-id">{pub.subnetId}</div>
                  )}
                  {natAzSet.has(az) && (
                    <div className="vpc-map-nat-badge">NAT gateway</div>
                  )}
                </div>
              )}
              {priv && (
                <div className="vpc-map-subnet vpc-map-subnet-private">
                  <div className="vpc-map-subnet-title">Private subnet</div>
                  <div className="vpc-map-subnet-cidr">{priv.cidr}</div>
                  {showIds && priv.subnetId && (
                    <div className="vpc-map-id">{priv.subnetId}</div>
                  )}
                </div>
              )}
              {!pub && !priv && (
                <div className="vpc-map-subnet vpc-map-subnet-empty">
                  No subnet
                </div>
              )}
            </div>
          );
        })}
      </div>

      {s3Endpoint && (
        <div className="vpc-map-endpoint">
          S3 Gateway endpoint
          {showIds && ids?.s3EndpointId ? ` · ${ids.s3EndpointId}` : ''}
        </div>
      )}
    </div>
  );
}
