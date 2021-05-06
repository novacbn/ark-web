import type {SvelteComponent} from "svelte";

// @ts-ignore
import {AlertTriangle} from "svelte-feather/components/AlertTriangle";
// @ts-ignore
import {CheckCircle} from "svelte-feather/components/CheckCircle";
// @ts-ignore
import {XCircle} from "svelte-feather/components/XCircle";

// @ts-ignore
import {ChevronLeft} from "svelte-feather/components/ChevronLeft";
// @ts-ignore
import {ChevronRight} from "svelte-feather/components/ChevronRight";
// @ts-ignore
import {Menu} from "svelte-feather/components/Menu";
// @ts-ignore
import {MoreVertical} from "svelte-feather/components/MoreVertical";
// @ts-ignore
import {Search} from "svelte-feather/components/Search";
// @ts-ignore
import {X} from "svelte-feather/components/X";

// @ts-ignore
import {Copy} from "svelte-feather/components/Copy";
// @ts-ignore
import {Edit} from "svelte-feather/components/Edit";
// @ts-ignore
import {Paperclip} from "svelte-feather/components/Paperclip";
// @ts-ignore
import {PlusCircle} from "svelte-feather/components/PlusCircle";
// @ts-ignore
import {Share2} from "svelte-feather/components/Share2";
// @ts-ignore
import {Sliders} from "svelte-feather/components/Sliders";
// @ts-ignore
import {Trash2} from "svelte-feather/components/Trash2";

// @ts-ignore
import {Download} from "svelte-feather/components/Download";
// @ts-ignore
import {Upload} from "svelte-feather/components/Upload";

// @ts-ignore
import {Disc} from "svelte-feather/components/Disc";
// @ts-ignore
import {File} from "svelte-feather/components/File";
// @ts-ignore
import {FileText} from "svelte-feather/components/FileText";
// @ts-ignore
import {FolderPlus} from "svelte-feather/components/FolderPlus";
// @ts-ignore
import {Film} from "svelte-feather/components/Film";
// @ts-ignore
import {Folder} from "svelte-feather/components/Folder";
// @ts-ignore
import {Image} from "svelte-feather/components/Image";

export const ICON_ALERT: SvelteComponent = AlertTriangle;

export const ICON_AFFIRMATIVE: SvelteComponent = CheckCircle;

export const ICON_NEGATIVE: SvelteComponent = XCircle;

//

export const ICON_CLOSE: SvelteComponent = X;

export const ICON_MENU: SvelteComponent = Menu;

export const ICON_NEXT: SvelteComponent = ChevronRight;

export const ICON_OVERFLOW: SvelteComponent = MoreVertical;

export const ICON_PREVIOUS: SvelteComponent = ChevronLeft;

export const ICON_SEARCH: SvelteComponent = Search;

//

export const ICON_ATTACHMENT: SvelteComponent = Paperclip;

export const ICON_COPY: SvelteComponent = Copy;

export const ICON_EDIT: SvelteComponent = Edit;

export const ICON_MODIFY: SvelteComponent = Sliders;

export const ICON_NEW: SvelteComponent = PlusCircle;

export const ICON_REMOVE: SvelteComponent = Trash2;

export const ICON_SHARE: SvelteComponent = Share2;

//

export const ICON_DOWNLOAD: SvelteComponent = Download;

export const ICON_UPLOAD: SvelteComponent = Upload;

//

export const ICON_FILE: SvelteComponent = File;

export const ICON_DIRECTORY: SvelteComponent = Folder;

export const ICON_DIRECTORY_NEW: SvelteComponent = FolderPlus;

export const ICON_MIMETYPE_AUDIO: SvelteComponent = Disc;

export const ICON_MIMETYPE_IMAGE: SvelteComponent = Image;

export const ICON_MIMETYPE_TEXT: SvelteComponent = FileText;

export const ICON_MIMETYPE_VIDEO: SvelteComponent = Film;
