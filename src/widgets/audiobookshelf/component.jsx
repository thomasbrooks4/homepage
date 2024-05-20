import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export const audiobookshelfDefaultFields = ["podcasts", "podcastsDuration", "books", "booksDuration"];

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: librariesData, error: librariesError } = useWidgetAPI(widget, "libraries");
  const { data: usersData, error: usersError } = useWidgetAPI(widget, "online");

  if (librariesError) {
    return <Container service={service} error={librariesError} />;
  }
  if (usersError) {
    return <Container service={service} error={usersError} />;
  }

  // Default fields
  if (!widget.fields?.length > 0) {
    widget.fields = audiobookshelfDefaultFields;
  }
  const MAX_ALLOWED_FIELDS = 4;
  // Limits max number of displayed fields
  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }
  
  if (!librariesData) {
    return (
      <Container service={service}>
        <Block label="audiobookshelf.usersOnline" />
        <Block label="audiobookshelf.podcasts" />
        <Block label="audiobookshelf.podcastsDuration" />
        <Block label="audiobookshelf.books" />
        <Block label="audiobookshelf.booksDuration" />
      </Container>
    );
  }

  const usersOnline = usersData.openSessions?.length ?? 0;
  
  const podcastLibraries = librariesData.filter((l) => l.mediaType === "podcast");
  const bookLibraries = librariesData.filter((l) => l.mediaType === "book");

  const totalPodcasts = podcastLibraries.reduce((total, pL) => parseInt(pL.stats?.totalItems, 10) + total, 0);
  const totalBooks = bookLibraries.reduce((total, bL) => parseInt(bL.stats?.totalItems, 10) + total, 0);

  const totalPodcastsDuration = podcastLibraries.reduce((total, pL) => parseFloat(pL.stats?.totalDuration) + total, 0);
  const totalBooksDuration = bookLibraries.reduce((total, bL) => parseFloat(bL.stats?.totalDuration) + total, 0);

  return (
    <Container service={service}>
      <Block label="audiobookshelf.usersOnline" value={t("common.number", { value: usersOnline })} />
      <Block label="audiobookshelf.podcasts" value={t("common.number", { value: totalPodcasts })} />
      <Block
        label="audiobookshelf.podcastsDuration"
        value={t("common.number", {
          value: totalPodcastsDuration / 60,
          maximumFractionDigits: 0,
          style: "unit",
          unit: "minute",
        })}
      />
      <Block label="audiobookshelf.books" value={t("common.number", { value: totalBooks })} />
      <Block
        label="audiobookshelf.booksDuration"
        value={t("common.number", {
          value: totalBooksDuration / 60,
          maximumFractionDigits: 0,
          style: "unit",
          unit: "minute",
        })}
      />
    </Container>
  );
}
