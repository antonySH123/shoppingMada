import { Navigate, useParams } from "react-router-dom";
import Iuser from "../../../Interface/UserInterface";
import { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import { LiaAtSolid, LiaPhoneAltSolid, LiaUser } from "react-icons/lia";
import useCSRF from "../../../helper/useCSRF";
import { useAuth } from "../../../helper/useAuth";
import Preloader from "../../loading/Preloader";
import { AdminButton, PageHeader } from "../ui";

interface IState {
  user: Iuser | null;
  isActive: boolean | null;
}

type Action =
  | { type: "FETCH_START"; payload: Iuser }
  | { type: "CHECK_ACCOUNT"; payload: boolean };

const initialState: IState = {
  user: null,
  isActive: null,
};

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, user: action.payload };
    case "CHECK_ACCOUNT":
      return { ...state, isActive: action.payload };
    default:
      throw new Error();
  }
};

function AccountsDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const csrf = useCSRF();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const checkAccount = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}account/status/${id}`,
        {
          credentials: "include",
        },
      );

      if (response.status === 400) {
        dispatch({ type: "CHECK_ACCOUNT", payload: false });
      }

      if (response.status === 200) {
        dispatch({ type: "CHECK_ACCOUNT", payload: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [id]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}user/${id}`,
        {
          credentials: "include",
        },
      );
      const result = await response.json();
      if ((result.status as string).toLocaleLowerCase() === "success") {
        dispatch({ type: "FETCH_START", payload: result.data });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [id]);

  useEffect(() => {
    checkAccount();
    fetchData();
  }, [checkAccount, fetchData, id]);

  const handleRoleChange = useCallback(async () => {
    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}account/${id}/admin`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "xsrf-token": csrf,
            },
          },
        );

        if (!response.ok) {
          toast.error("Une erreur est survenue!");
        }

        if (response.status === 201) {
          const result = await response.json();
          toast.success(result.message);
        }

        if (response.status === 403) {
          const result = await response.json();
          toast.warning(result.message);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [csrf, id]);

  const handleAccountStatus = useCallback(async () => {
    if (!csrf || !id || state.isActive === null || isUpdatingStatus) return;
    const activate = !state.isActive;
    if (
      !activate &&
      !window.confirm(
        "Désactiver ce compte ? L’utilisateur ne pourra plus se connecter.",
      )
    )
      return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}account/${id}/${activate ? "active" : "block"}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "xsrf-token": csrf },
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Impossible de modifier le statut du compte.",
        );
      dispatch({ type: "CHECK_ACCOUNT", payload: activate });
      toast.success(result.message);
      if (activate) void fetchData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut du compte.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [csrf, fetchData, id, isUpdatingStatus, state.isActive]);

  if (user?.userGroupMember_id.usergroup_id.name !== "Super Admin") {
    return <Navigate to="/espace_vendeur/dash" />;
  }

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comptes"
        title="Informations du compte"
        description="Consultez le profil, le rôle et les informations de contact de l’utilisateur."
      />

      <section className="admin-panel p-5">
        <div className="flex flex-col gap-4 border-b border-[var(--admin-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--admin-surface-raised)] text-2xl text-[var(--admin-accent-solid)]">
              <LiaUser />
            </div>
            <div>
              <strong className="flex items-center gap-2 text-lg text-[var(--admin-text)]">
                {state.user?.username}
              </strong>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <LiaAtSolid /> {state.user?.email}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <LiaPhoneAltSolid /> {state.user?.phonenumber}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <strong className="text-sm uppercase tracking-[0.08em] text-[var(--admin-muted)]">
              {state.user?.userGroupMember_id?.usergroup_id?.name ??
                "Compte désactivé"}
            </strong>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {state.user?.userGroupMember_id?.usergroup_id?.name !==
                "Super Admin" && (
                <>
                  <AdminButton
                    variant={state.isActive ? "danger" : "primary"}
                    size="sm"
                    onClick={() => void handleAccountStatus()}
                    disabled={isUpdatingStatus || state.isActive === null}
                  >
                    {isUpdatingStatus
                      ? "Mise à jour…"
                      : state.isActive
                        ? "Désactiver le compte"
                        : "Activer le compte"}
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={handleRoleChange}
                  >
                    Définir comme admin
                  </AdminButton>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="admin-field">
            <label>Nom</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.firstName ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field">
            <label>Prénoms</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.lastName ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field md:col-span-2">
            <label>Adresse</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.adresse ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field">
            <label>Téléphone</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={state.user?.personnalInfo_id?.phoneNumber ?? ""}
              readOnly
            />
          </div>

          <div className="admin-field">
            <label>Statut du compte</label>
            <input
              type="text"
              className="admin-field__control cursor-not-allowed"
              value={
                state.isActive === null
                  ? "Vérification en cours…"
                  : state.isActive
                    ? "Actif"
                    : "Désactivé"
              }
              readOnly
            />
          </div>
        </div>
      </section>

      {state.user?.boutiks_id && (
        <section className="admin-panel p-5">
          <div className="admin-panel-heading -mx-5 -mt-5 mb-5">
            <div>
              <p className="admin-panel-kicker">Boutique associée</p>
              <h2 className="admin-panel-title">
                {state.user.boutiks_id.name}
              </h2>
              <p className="admin-panel-subtitle">
                Coordonnées et liens publics gérés par ce vendeur.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <p className="text-sm text-[var(--admin-muted)]">
              Téléphone :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.phoneNumber || "—"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              E-mail :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.email || "—"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              Adresse :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.adresse || "—"}
              </strong>
            </p>
            <p className="text-sm text-[var(--admin-muted)]">
              Plan :{" "}
              <strong className="text-[var(--admin-text)]">
                {state.user.boutiks_id.plan || "—"}
              </strong>
            </p>
            {[
              ["Site web", state.user.boutiks_id.websiteUrl],
              ["Facebook", state.user.boutiks_id.facebookUrl],
              ["Instagram", state.user.boutiks_id.instagramUrl],
              ["TikTok", state.user.boutiks_id.tiktokUrl],
              ["YouTube", state.user.boutiks_id.youtubeUrl],
            ]
              .filter(([, url]) => url)
              .map(([label, url]) => (
                <p key={label} className="text-sm text-[var(--admin-muted)]">
                  {label} :{" "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-[var(--admin-accent-solid)] hover:underline"
                  >
                    {url}
                  </a>
                </p>
              ))}
            {state.user.boutiks_id.description && (
              <p className="text-sm leading-6 text-[var(--admin-muted)] sm:col-span-2">
                {state.user.boutiks_id.description}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default AccountsDetails;
