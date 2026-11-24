"use client";

import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormGrid,
  FormImageUpload,
  FormInput,
  FormToggle,
} from "./shared/FormFields";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { activeField, requiredString } from "./shared/validation";

type Values = {
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
  bannerLink: string;
  position: number;
  status: boolean;
};

const initialValues: Values = {
  desktopImage: "",
  tabletImage: "",
  mobileImage: "",
  bannerLink: "",
  position: 1,
  status: true,
};

const schema = Yup.object({
  desktopImage: requiredString("Desktop image", 1),
  tabletImage: Yup.string(),
  mobileImage: Yup.string(),
  bannerLink: requiredString("Banner link", 1),
  position: Yup.number().min(1).required("Position is required"),
  status: activeField,
});

export function BannerForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      desktopImage: String(r.desktopImage ?? r.image ?? ""),
      tabletImage: String(r.tabletImage ?? ""),
      mobileImage: String(r.mobileImage ?? ""),
      bannerLink: String(r.bannerLink ?? r.buttonLink ?? ""),
      position: Number(r.position ?? 1),
      status: Boolean(r.status ?? true),
    }),
    mapValuesToPayload: (v) => ({
      desktopImage: v.desktopImage,
      tabletImage: v.tabletImage || null,
      mobileImage: v.mobileImage || null,
      bannerLink: v.bannerLink,
      position: v.position,
      status: v.status,
    }),
  });

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Banner" : "Add Banner"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormGrid>
          <FormImageUpload
            formik={formik}
            name="desktopImage"
            label="Desktop Banner (3:1, max 1920px)"
            required
            uploadPath={UPLOAD_PATHS.banners}
            imageType="banner"
            previewMode="full"
          />
          <FormImageUpload
            formik={formik}
            name="tabletImage"
            label="Tablet Banner (2:1, max 1200px)"
            uploadPath={UPLOAD_PATHS.banners}
            imageType="banner_tablet"
            previewMode="full"
          />
          <FormImageUpload
            formik={formik}
            name="mobileImage"
            label="Mobile Banner (3:2, max 800px)"
            uploadPath={UPLOAD_PATHS.banners}
            imageType="banner_mobile"
            previewMode="full"
          />
          <FormInput
            formik={formik}
            name="bannerLink"
            label="Banner Link"
            required
          />
          <FormInput
            formik={formik}
            name="position"
            label="Position"
            type="number"
            min="1"
            required
          />
          <FormFullWidth>
            <FormToggle formik={formik} name="status" label="Active Status" />
          </FormFullWidth>
        </FormGrid>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Banner"
          onCancel={() => router.push(`/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
